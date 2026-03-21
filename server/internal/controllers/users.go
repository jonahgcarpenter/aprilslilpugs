package controllers

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
)

func CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		slog.Debug("create user: invalid request body", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		slog.Error("create user: failed to hash password", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	query := `
		INSERT INTO users (first_name, last_name, email, password_hash, phone_number, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at`

	err = database.Pool.QueryRow(c, query,
		user.FirstName, user.LastName, user.Email, hashedPassword, user.PhoneNumber,
	).Scan(&user.ID, &user.CreatedAt)

	if err != nil {
		slog.Error("create user: database error", "email", user.Email, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	slog.Info("create user: user created", "user_id", user.ID)
	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully", "userId": user.ID})
}

func GetUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	query := `
		SELECT 
			id, first_name, last_name, email, phone_number, created_at, updated_at
		FROM users
		WHERE id = $1`

	err := database.Pool.QueryRow(c, query, id).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email,
		&user.PhoneNumber, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		slog.Debug("get user: not found", "id", id, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func UpdateUser(c *gin.Context) {
	idParam := c.Param("id")

	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	authUser := userVal.(models.User)
	if strconv.Itoa(authUser.ID) != idParam {
		slog.Warn("update user: attempted to update another user's profile", "auth_user_id", authUser.ID, "target_id", idParam)
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own profile"})
		return
	}

	var input models.User
	if err := c.ShouldBindJSON(&input); err != nil {
		slog.Debug("update user: invalid request body", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updateQuery := `
		UPDATE users 
		SET first_name=$1, last_name=$2, phone_number=$3, updated_at=NOW()
		WHERE id = $4
		RETURNING id, email, first_name, last_name, phone_number, updated_at`

	var updatedUser models.User
	err := database.Pool.QueryRow(c, updateQuery,
		input.FirstName, input.LastName, input.PhoneNumber, idParam,
	).Scan(&updatedUser.ID, &updatedUser.Email, &updatedUser.FirstName, &updatedUser.LastName, &updatedUser.PhoneNumber, &updatedUser.UpdatedAt)

	if err != nil {
		slog.Error("update user: database error", "id", idParam, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	slog.Info("update user: user updated", "user_id", updatedUser.ID)
	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully", "user": updatedUser})
}

func DeleteUser(c *gin.Context) {
	idParam := c.Param("id")

	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	authUser := userVal.(models.User)
	if strconv.Itoa(authUser.ID) != idParam {
		slog.Warn("delete user: attempted to delete another user's profile", "auth_user_id", authUser.ID, "target_id", idParam)
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own profile"})
		return
	}

	_, err := database.Pool.Exec(c, "DELETE FROM users WHERE id = $1", idParam)
	if err != nil {
		slog.Error("delete user: database error", "id", idParam, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	slog.Info("delete user: user deleted", "user_id", idParam)
	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
