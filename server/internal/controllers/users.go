package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
)

func CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	query := `
		INSERT INTO users (first_name, last_name, email, password_hash, phone_number, location, story, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id, created_at`

	err = database.Pool.QueryRow(c, query,
		user.FirstName, user.LastName, user.Email, hashedPassword,
		user.PhoneNumber, user.Location, user.Story,
	).Scan(&user.ID, &user.CreatedAt)

	if err != nil {
		fmt.Println("Database Error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully", "userId": user.ID})
}

func GetUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	query := `SELECT id, first_name, last_name, email, phone_number, location, story, profile_picture, images FROM users WHERE id = $1`

	err := database.Pool.QueryRow(c, query, id).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email,
		&user.PhoneNumber, &user.Location, &user.Story,
		&user.ProfilePicture, &user.Images,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.ProfilePicture != "" {
		user.ProfilePicture = "/uploads/users/" + user.ProfilePicture
	}
	for i, img := range user.Images {
		if img != "" {
			user.Images[i] = "/uploads/users/" + img
		}
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
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own profile"})
		return
	}

	var currentUser models.User
	err := database.Pool.QueryRow(c, "SELECT profile_picture, images FROM users WHERE id = $1", idParam).Scan(&currentUser.ProfilePicture, &currentUser.Images)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	firstName := c.PostForm("firstName")
	lastName := c.PostForm("lastName")
	phone := c.PostForm("phoneNumber")
	location := c.PostForm("location")
	story := c.PostForm("story")

	newProfilePic := currentUser.ProfilePicture
	file, err := c.FormFile("profilePicture")
	if err == nil {
		if currentUser.ProfilePicture != "" {
			os.Remove(filepath.Join("public/uploads/users", currentUser.ProfilePicture))
		}
		filename := fmt.Sprintf("%d-%s", time.Now().Unix(), file.Filename)
		dst := filepath.Join("public/uploads/users", filename)
		c.SaveUploadedFile(file, dst)
		newProfilePic = filename
	}

	newImages := currentUser.Images
	if len(newImages) < 2 {
		newImages = append(newImages, "", "")
	}

	for i := 0; i < 2; i++ {
		formKey := fmt.Sprintf("galleryImage%d", i)
		gFile, err := c.FormFile(formKey)
		if err == nil {
			if len(newImages) > i && newImages[i] != "" {
				os.Remove(filepath.Join("public/uploads/users", newImages[i]))
			}
			filename := fmt.Sprintf("%d-gallery-%d-%s", time.Now().Unix(), i, gFile.Filename)
			dst := filepath.Join("public/uploads/users", filename)
			c.SaveUploadedFile(gFile, dst)
			newImages[i] = filename
		}
	}

	updateQuery := `
		UPDATE users 
		SET first_name=$1, last_name=$2, phone_number=$3, location=$4, story=$5, profile_picture=$6, images=$7, updated_at=NOW()
		WHERE id = $8
		RETURNING id, email`

	var updatedUser models.User
	err = database.Pool.QueryRow(c, updateQuery,
		firstName, lastName, phone, location, story, newProfilePic, newImages, idParam,
	).Scan(&updatedUser.ID, &updatedUser.Email)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
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
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own profile"})
		return
	}

	var currentUser models.User
	err := database.Pool.QueryRow(c, "SELECT profile_picture, images FROM users WHERE id = $1", idParam).Scan(&currentUser.ProfilePicture, &currentUser.Images)
	if err == nil {
		if currentUser.ProfilePicture != "" {
			os.Remove(filepath.Join("public/uploads/users", currentUser.ProfilePicture))
		}
		for _, img := range currentUser.Images {
			if img != "" {
				os.Remove(filepath.Join("public/uploads/users", img))
			}
		}
	}

	_, err = database.Pool.Exec(c, "DELETE FROM users WHERE id = $1", idParam)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
