package controllers

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
)

func LoginUser(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Debug("login: invalid request body", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	var user models.User
	query := `SELECT id, first_name, last_name, email, password_hash FROM users WHERE email = $1`
	err := database.Pool.QueryRow(c, query, req.Email).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PasswordHash)

	if err != nil {
		if err == pgx.ErrNoRows {
			slog.Debug("login: email not found", "email", req.Email)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect email"})
			return
		}

		slog.Error("login: failed to fetch user by email", "email", req.Email, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to authenticate user"})
		return
	}

	if !utils.CheckPassword(req.Password, user.PasswordHash) {
		slog.Debug("login: incorrect password", "email", req.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect password"})
		return
	}

	var sessionID int
	expirationTime := time.Now().Add(24 * time.Hour)

	clientIP := c.ClientIP()
	userAgent := c.Request.UserAgent()

	insertSession := `
		INSERT INTO sessions (user_id, user_agent, ip_address, expires_at) 
		VALUES ($1, $2, $3, $4) 
		RETURNING id`

	err = database.Pool.QueryRow(c, insertSession, user.ID, userAgent, clientIP, expirationTime).Scan(&sessionID)
	if err != nil {
		slog.Error("login: failed to create session", "user_id", user.ID, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	tokenString, err := utils.GenerateToken(sessionID)
	if err != nil {
		slog.Error("login: failed to generate token", "session_id", sessionID, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	slog.Info("login: user authenticated", "user_id", user.ID, "remote_addr", clientIP)

	c.JSON(http.StatusOK, models.LoginResponse{
		Token:     tokenString,
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
	})
}

func LogoutUser(c *gin.Context) {
	sessionID, exists := c.Get("session_id")
	if exists {
		_, err := database.Pool.Exec(c, "DELETE FROM sessions WHERE id = $1", sessionID)
		if err != nil {
			slog.Error("logout: failed to delete session", "session_id", sessionID, "error", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log out"})
			return
		}

		slog.Info("logout: session ended", "session_id", sessionID)
	} else {
		slog.Warn("logout: session id missing from request context")
	}

	c.JSON(http.StatusOK, gin.H{"message": "Successfully logged out"})
}
