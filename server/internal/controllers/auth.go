package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
)

func LoginUser(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	var user models.User
	query := `SELECT id, first_name, last_name, email, password_hash FROM users WHERE email = $1`
	err := database.Pool.QueryRow(c, query, req.Email).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PasswordHash)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect email"})
		return
	}

	if !utils.CheckPassword(req.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect password"})
		return
	}

	tokenString, err := utils.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, models.LoginResponse{
		Token:     tokenString,
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
	})
}

func LogoutUser(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Successfully logged out"})
}
