package middleware

import (
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/config"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
)

func RequireAuth(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		slog.Debug("auth: missing Authorization header", "path", c.FullPath())
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
		return
	}

	tokenString := ""
	if len(authHeader) > 7 && strings.ToUpper(authHeader[0:6]) == "BEARER" {
		tokenString = authHeader[7:]
	} else {
		slog.Debug("auth: malformed Authorization header", "path", c.FullPath())
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format. Format: Bearer <token>"})
		return
	}

	cfg := config.Load()
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(cfg.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		slog.Debug("auth: invalid or expired token", "path", c.FullPath(), "error", err)
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		slog.Warn("auth: failed to extract token claims", "path", c.FullPath())
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	if float64(time.Now().Unix()) > claims["exp"].(float64) {
		slog.Debug("auth: token expired", "path", c.FullPath())
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token expired"})
		return
	}

	sessionIDFloat, ok := claims["sid"].(float64)
	if !ok {
		slog.Warn("auth: token missing sid claim", "path", c.FullPath())
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token session"})
		return
	}
	sessionID := int(sessionIDFloat)

	var user models.User

	query := `SELECT u.id, u.first_name, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = $1 AND s.expires_at > NOW()`
	err = database.Pool.QueryRow(c, query, sessionID).Scan(&user.ID, &user.FirstName, &user.Email)

	if err != nil {
		slog.Debug("auth: session not found or expired", "session_id", sessionID, "path", c.FullPath())
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Session expired or invalid"})
		return
	}

	slog.Debug("auth: request authorized", "user_id", user.ID, "session_id", sessionID, "path", c.FullPath())

	c.Set("user", user)
	c.Set("session_id", sessionID)

	c.Next()
}
