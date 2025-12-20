package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
)

func GetDogs(c *gin.Context) {
	rows, err := database.Pool.Query(c, "SELECT id, name, gender, description, birth_date, profile_picture, images FROM dogs ORDER BY created_at DESC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch dogs"})
		return
	}
	defer rows.Close()

	var dogs []models.Dog
	for rows.Next() {
		var dog models.Dog
		if err := rows.Scan(&dog.ID, &dog.Name, &dog.Gender, &dog.Description, &dog.BirthDate, &dog.ProfilePicture, &dog.Images); err != nil {
			continue
		}
		formatDogImages(&dog)
		dogs = append(dogs, dog)
	}

	c.JSON(http.StatusOK, dogs)
}

func GetDog(c *gin.Context) {
	id := c.Param("id")
	var dog models.Dog

	err := database.Pool.QueryRow(c, "SELECT id, name, gender, description, birth_date, profile_picture, images FROM dogs WHERE id=$1", id).Scan(
		&dog.ID, &dog.Name, &dog.Gender, &dog.Description, &dog.BirthDate, &dog.ProfilePicture, &dog.Images,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dog not found"})
		return
	}
	formatDogImages(&dog)
	c.JSON(http.StatusOK, dog)
}

func CreateDog(c *gin.Context) {
	name := c.PostForm("name")
	gender := c.PostForm("gender")
	desc := c.PostForm("description")
	dobStr := c.PostForm("birthDate")

	birthDate, err := time.Parse("2006-01-02", dobStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid birthDate format. Use YYYY-MM-DD"})
		return
	}

	var profilePic string
	file, err := c.FormFile("profilePicture")
	if err == nil {
		filename := fmt.Sprintf("%d-%s", time.Now().Unix(), file.Filename)
		dst := filepath.Join("public/uploads/dogs", filename)
		c.SaveUploadedFile(file, dst)
		profilePic = filename
	}

	var images []string
	for i := 0; i < 5; i++ {
		formKey := fmt.Sprintf("galleryImage%d", i)
		gFile, err := c.FormFile(formKey)
		if err == nil {
			filename := fmt.Sprintf("%d-gallery-%d-%s", time.Now().Unix(), i, gFile.Filename)
			dst := filepath.Join("public/uploads/dogs", filename)
			c.SaveUploadedFile(gFile, dst)
			images = append(images, filename)
		}
	}
	if images == nil { images = []string{} }

	var dogID int
	query := `
		INSERT INTO dogs (name, gender, description, birth_date, profile_picture, images)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
	
	err = database.Pool.QueryRow(c, query, name, gender, desc, birthDate, profilePic, images).Scan(&dogID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Dog created", "dogId": dogID})
}

func UpdateDog(c *gin.Context) {
	id := c.Param("id")
	
	var currentDog models.Dog
	err := database.Pool.QueryRow(c, "SELECT profile_picture, images FROM dogs WHERE id=$1", id).Scan(&currentDog.ProfilePicture, &currentDog.Images)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dog not found"})
		return
	}

	name := c.PostForm("name")
	gender := c.PostForm("gender")
	desc := c.PostForm("description")
	dobStr := c.PostForm("birthDate")
	
	birthDate, err := time.Parse("2006-01-02", dobStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid birthDate format"})
		return
	}

	newProfilePic := currentDog.ProfilePicture
	file, err := c.FormFile("profilePicture")
	if err == nil {
		if currentDog.ProfilePicture != "" {
			os.Remove(filepath.Join("public/uploads/dogs", currentDog.ProfilePicture))
		}
		filename := fmt.Sprintf("%d-%s", time.Now().Unix(), file.Filename)
		c.SaveUploadedFile(file, filepath.Join("public/uploads/dogs", filename))
		newProfilePic = filename
	}

	newImages := currentDog.Images
	for i := 0; i < 5; i++ {
		formKey := fmt.Sprintf("galleryImage%d", i)
		gFile, err := c.FormFile(formKey)
		if err == nil {
			filename := fmt.Sprintf("%d-gallery-%d-%s", time.Now().Unix(), i, gFile.Filename)
			c.SaveUploadedFile(gFile, filepath.Join("public/uploads/dogs", filename))
			newImages = append(newImages, filename)
		}
	}

	_, err = database.Pool.Exec(c, `
		UPDATE dogs SET name=$1, gender=$2, description=$3, birth_date=$4, profile_picture=$5, images=$6, updated_at=NOW()
		WHERE id=$7`, 
		name, gender, desc, birthDate, newProfilePic, newImages, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Dog updated successfully"})
}

func DeleteDog(c *gin.Context) {
	id := c.Param("id")
	var currentDog models.Dog
	err := database.Pool.QueryRow(c, "SELECT profile_picture, images FROM dogs WHERE id=$1", id).Scan(&currentDog.ProfilePicture, &currentDog.Images)
	
	if err == nil {
		os.Remove(filepath.Join("public/uploads/dogs", currentDog.ProfilePicture))
		for _, img := range currentDog.Images {
			os.Remove(filepath.Join("public/uploads/dogs", img))
		}
	}

	_, err = database.Pool.Exec(c, "DELETE FROM dogs WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete dog"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Dog deleted"})
}

func formatDogImages(dog *models.Dog) {
	if dog.ProfilePicture != "" {
		dog.ProfilePicture = "/uploads/dogs/" + dog.ProfilePicture
	}
	for i, img := range dog.Images {
		if img != "" {
			dog.Images[i] = "/uploads/dogs/" + img
		}
	}
}
