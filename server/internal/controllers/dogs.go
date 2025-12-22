package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
)

func GetDogs(c *gin.Context) {
	query := `
		SELECT 
			id, name, gender, description, birth_date,
			profile_picture, gallery, created_at, updated_at
		FROM dogs
		ORDER BY created_at DESC`

	rows, err := database.Pool.Query(c, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch dogs"})
		return
	}
	defer rows.Close()

	var dogs []models.Dog
	for rows.Next() {
		var dog models.Dog
		var ppRaw, galleryRaw []byte

		if err := rows.Scan(
			&dog.ID, &dog.Name, &dog.Gender, &dog.Description, &dog.BirthDate,
			&ppRaw, &galleryRaw, &dog.CreatedAt, &dog.UpdatedAt,
		); err != nil {
			continue
		}

		if len(ppRaw) > 0 { _ = json.Unmarshal(ppRaw, &dog.ProfilePicture) }
		if len(galleryRaw) > 0 { _ = json.Unmarshal(galleryRaw, &dog.Gallery) }
		if dog.Gallery == nil { dog.Gallery = []models.Image{} }

		dogs = append(dogs, dog)
	}

	c.JSON(http.StatusOK, dogs)
}

func GetDog(c *gin.Context) {
	id := c.Param("id")
	var dog models.Dog
	var ppRaw, galleryRaw []byte

	query := `
		SELECT 
			id, name, gender, description, birth_date,
			profile_picture, gallery, created_at, updated_at
		FROM dogs
		WHERE id=$1`

	err := database.Pool.QueryRow(c, query, id).Scan(
		&dog.ID, &dog.Name, &dog.Gender, &dog.Description, &dog.BirthDate,
		&ppRaw, &galleryRaw, &dog.CreatedAt, &dog.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dog not found"})
		return
	}

	if len(ppRaw) > 0 { _ = json.Unmarshal(ppRaw, &dog.ProfilePicture) }
	if len(galleryRaw) > 0 { _ = json.Unmarshal(galleryRaw, &dog.Gallery) }
	if dog.Gallery == nil { dog.Gallery = []models.Image{} }

	c.JSON(http.StatusOK, dog)
}

func CreateDog(c *gin.Context) {
	profilePic, _ := utils.UploadAndCreateImage(c, "profilePicture", "dogs")

	gallery := []models.Image{}
	for i := 0; i < 50; i++ { 
		formKey := fmt.Sprintf("galleryImage%d", i)
		img, err := utils.UploadAndCreateImage(c, formKey, "dogs")
		
		if err == nil && img != nil {
			gallery = append(gallery, *img)
		} 
	}

	name := c.PostForm("name")
	gender := c.PostForm("gender")
	desc := c.PostForm("description")
	birthDate, _ := time.Parse("2006-01-02", c.PostForm("birthDate"))

	ppJSON, _ := json.Marshal(profilePic)
	galleryJSON, _ := json.Marshal(gallery)

	var dogID int
	query := `
		INSERT INTO dogs (name, gender, description, birth_date, profile_picture, gallery)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
	
	err := database.Pool.QueryRow(c, query, name, gender, desc, birthDate, ppJSON, galleryJSON).Scan(&dogID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Dog created", "dogId": dogID})
}

func UpdateDog(c *gin.Context) {
	id := c.Param("id")
	
	var oldPPRaw, oldGalleryRaw []byte
	err := database.Pool.QueryRow(c, "SELECT profile_picture, gallery FROM dogs WHERE id=$1", id).Scan(&oldPPRaw, &oldGalleryRaw)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dog not found"})
		return
	}

	var currentPP *models.Image
	var currentGallery []models.Image
	if len(oldPPRaw) > 0 { _ = json.Unmarshal(oldPPRaw, &currentPP) }
	if len(oldGalleryRaw) > 0 { _ = json.Unmarshal(oldGalleryRaw, &currentGallery) }
	if currentGallery == nil { currentGallery = []models.Image{} }

	name := c.PostForm("name")
	gender := c.PostForm("gender")
	desc := c.PostForm("description")
	birthDate, _ := time.Parse("2006-01-02", c.PostForm("birthDate"))

	newPP := currentPP
	if uploadedImg, err := utils.UploadAndCreateImage(c, "profilePicture", "dogs"); err == nil && uploadedImg != nil {
		newPP = uploadedImg
		if currentPP != nil { _ = utils.DeleteImage(currentPP.URL) }
	}

	newGalleryItems := []models.Image{}
	for i := 0; i < 50; i++ {
		formKey := fmt.Sprintf("galleryImage%d", i)
		if img, err := utils.UploadAndCreateImage(c, formKey, "dogs"); err == nil && img != nil {
			newGalleryItems = append(newGalleryItems, *img)
		}
	}

	finalGallery := append(currentGallery, newGalleryItems...)

	ppJSON, _ := json.Marshal(newPP)
	galleryJSON, _ := json.Marshal(finalGallery)

	_, err = database.Pool.Exec(c, `
		UPDATE dogs SET name=$1, gender=$2, description=$3, birth_date=$4, profile_picture=$5, gallery=$6, updated_at=NOW()
		WHERE id=$7`, 
		name, gender, desc, birthDate, ppJSON, galleryJSON, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Dog updated successfully"})
}

func DeleteDog(c *gin.Context) {
	id := c.Param("id")
	
	var ppRaw, galleryRaw []byte
	_ = database.Pool.QueryRow(c, "SELECT profile_picture, gallery FROM dogs WHERE id=$1", id).Scan(&ppRaw, &galleryRaw)
	
	var pp *models.Image
	var gallery []models.Image
	if len(ppRaw) > 0 { _ = json.Unmarshal(ppRaw, &pp) }
	if len(galleryRaw) > 0 { _ = json.Unmarshal(galleryRaw, &gallery) }

	if pp != nil { _ = utils.DeleteImage(pp.URL) }
	for _, img := range gallery { _ = utils.DeleteImage(img.URL) }

	_, err := database.Pool.Exec(c, "DELETE FROM dogs WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete dog"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Dog deleted"})
}
