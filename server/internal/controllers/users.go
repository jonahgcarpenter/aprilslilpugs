package controllers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/lib/pq"
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
	var imageIDs []int64
	var pID *int
	var pURL, pAlt *string

	query := `
		SELECT 
			u.id, u.first_name, u.last_name, u.email, u.phone_number, u.location, u.story, u.image_ids,
			img.id, img.url, img.alt_text
		FROM users u
		LEFT JOIN images img ON u.profile_picture_id = img.id
		WHERE u.id = $1`

	err := database.Pool.QueryRow(c, query, id).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email,
		&user.PhoneNumber, &user.Location, &user.Story, pq.Array(&imageIDs),
		&pID, &pURL, &pAlt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if pID != nil {
		user.ProfilePicture = &models.Image{ID: *pID, URL: *pURL, AltText: *pAlt}
	}

	if len(imageIDs) > 0 {
		imgRows, _ := database.Pool.Query(c, "SELECT id, url, alt_text FROM images WHERE id = ANY($1)", pq.Array(imageIDs))
		defer imgRows.Close()
		for imgRows.Next() {
			var img models.Image
			if err := imgRows.Scan(&img.ID, &img.URL, &img.AltText); err == nil {
				user.Images = append(user.Images, img)
			}
		}
	} else {
		user.Images = []models.Image{}
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

	var currentPPID *int
	var currentImageIDs []int64
	err := database.Pool.QueryRow(c, "SELECT profile_picture_id, image_ids FROM users WHERE id = $1", idParam).Scan(&currentPPID, pq.Array(&currentImageIDs))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	firstName := c.PostForm("firstName")
	lastName := c.PostForm("lastName")
	phone := c.PostForm("phoneNumber")
	location := c.PostForm("location")
	story := c.PostForm("story")

	newPPID := currentPPID
	if uploadID, _ := utils.UploadAndCreateImage(c, "profilePicture", "users"); uploadID != nil {
		newPPID = uploadID
	}

	newImageIDs := currentImageIDs
	for i := 0; i < 5; i++ {
		if uploadID, _ := utils.UploadAndCreateImage(c, fmt.Sprintf("galleryImage%d", i), "users"); uploadID != nil {
			newImageIDs = append(newImageIDs, int64(*uploadID))
		}
	}

	updateQuery := `
		UPDATE users 
		SET first_name=$1, last_name=$2, phone_number=$3, location=$4, story=$5, profile_picture_id=$6, image_ids=$7, updated_at=NOW()
		WHERE id = $8
		RETURNING id, email`

	var updatedUser models.User
	err = database.Pool.QueryRow(c, updateQuery,
		firstName, lastName, phone, location, story, newPPID, pq.Array(newImageIDs), idParam,
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

	_, err := database.Pool.Exec(c, "DELETE FROM users WHERE id = $1", idParam)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
