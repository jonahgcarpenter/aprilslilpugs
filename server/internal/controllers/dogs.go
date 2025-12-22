//go:build ignore
package controllers

import (
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
			d.id, d.name, d.gender, d.description, d.birth_date,
			img.id, img.url, img.alt_text 
		FROM dogs d
		LEFT JOIN images img ON d.profile_picture_id = img.id
		ORDER BY d.created_at DESC`

	rows, err := database.Pool.Query(c, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch dogs"})
		return
	}
	defer rows.Close()

	var dogs []models.Dog
	for rows.Next() {
		var dog models.Dog
		var pID *int
		var pURL, pAlt *string

		if err := rows.Scan(
			&dog.ID, &dog.Name, &dog.Gender, &dog.Description, &dog.BirthDate,
			&pID, &pURL, &pAlt,
		); err != nil {
			continue
		}

		if pID != nil {
			dog.ProfilePicture = &models.Image{ID: *pID, URL: *pURL, AltText: *pAlt}
		}

		galleryQuery := `
			SELECT i.id, i.url, i.alt_text 
			FROM images i
			JOIN dog_gallery dg ON i.id = dg.image_id
			WHERE dg.dog_id = $1
			ORDER BY dg.display_order ASC`
		
		imgRows, _ := database.Pool.Query(c, galleryQuery, dog.ID)
		defer imgRows.Close()
		
		dog.Images = []models.Image{}
		for imgRows.Next() {
			var img models.Image
			if err := imgRows.Scan(&img.ID, &img.URL, &img.AltText); err == nil {
				dog.Images = append(dog.Images, img)
			}
		}

		dogs = append(dogs, dog)
	}

	c.JSON(http.StatusOK, dogs)
}

func GetDog(c *gin.Context) {
	id := c.Param("id")
	var dog models.Dog
	var pID *int
	var pURL, pAlt *string

	query := `
		SELECT 
			d.id, d.name, d.gender, d.description, d.birth_date,
			img.id, img.url, img.alt_text 
		FROM dogs d
		LEFT JOIN images img ON d.profile_picture_id = img.id
		WHERE d.id=$1`

	err := database.Pool.QueryRow(c, query, id).Scan(
		&dog.ID, &dog.Name, &dog.Gender, &dog.Description, &dog.BirthDate,
		&pID, &pURL, &pAlt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dog not found"})
		return
	}

	if pID != nil {
		dog.ProfilePicture = &models.Image{ID: *pID, URL: *pURL, AltText: *pAlt}
	}

	galleryQuery := `
		SELECT i.id, i.url, i.alt_text 
		FROM images i
		JOIN dog_gallery dg ON i.id = dg.image_id
		WHERE dg.dog_id = $1
		ORDER BY dg.display_order ASC`

	imgRows, _ := database.Pool.Query(c, galleryQuery, dog.ID)
	defer imgRows.Close()

	dog.Images = []models.Image{}
	for imgRows.Next() {
		var img models.Image
		if err := imgRows.Scan(&img.ID, &img.URL, &img.AltText); err == nil {
			dog.Images = append(dog.Images, img)
		}
	}

	c.JSON(http.StatusOK, dog)
}

func CreateDog(c *gin.Context) {
	profilePicID, err := utils.UploadAndCreateImage(c, "profilePicture", "dogs")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload profile picture"})
		return
	}

	name := c.PostForm("name")
	gender := c.PostForm("gender")
	desc := c.PostForm("description")
	birthDate, _ := time.Parse("2006-01-02", c.PostForm("birthDate"))

	var dogID int
	query := `
		INSERT INTO dogs (name, gender, description, birth_date, profile_picture_id)
		VALUES ($1, $2, $3, $4, $5) RETURNING id`
	
	err = database.Pool.QueryRow(c, query, name, gender, desc, birthDate, profilePicID).Scan(&dogID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for i := 0; i < 5; i++ {
		formKey := fmt.Sprintf("galleryImage%d", i)
		imgID, _ := utils.UploadAndCreateImage(c, formKey, "dogs")
		
		if imgID != nil {
			_, _ = database.Pool.Exec(c, 
				"INSERT INTO dog_gallery (dog_id, image_id, display_order) VALUES ($1, $2, $3)", 
				dogID, *imgID, i)
		}
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Dog created", "dogId": dogID})
}

func UpdateDog(c *gin.Context) {
	id := c.Param("id")
	
	var currentPPID *int
	err := database.Pool.QueryRow(c, "SELECT profile_picture_id FROM dogs WHERE id=$1", id).Scan(&currentPPID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dog not found"})
		return
	}

	name := c.PostForm("name")
	gender := c.PostForm("gender")
	desc := c.PostForm("description")
	birthDate, _ := time.Parse("2006-01-02", c.PostForm("birthDate"))

	newPPID := currentPPID
	uploadPPID, _ := utils.UploadAndCreateImage(c, "profilePicture", "dogs")
	if uploadPPID != nil {
		newPPID = uploadPPID
		// Optional: Delete old profile picture file/row here if you want to clean up
	}

	_, err = database.Pool.Exec(c, `
		UPDATE dogs SET name=$1, gender=$2, description=$3, birth_date=$4, profile_picture_id=$5, updated_at=NOW()
		WHERE id=$6`, 
		name, gender, desc, birthDate, newPPID, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for i := 0; i < 5; i++ {
		formKey := fmt.Sprintf("galleryImage%d", i)
		imgID, _ := utils.UploadAndCreateImage(c, formKey, "dogs")
		if imgID != nil {
			_, _ = database.Pool.Exec(c, 
				"INSERT INTO dog_gallery (dog_id, image_id, display_order) VALUES ($1, $2, $3)", 
				id, *imgID, i)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Dog updated successfully"})
}

func DeleteDog(c *gin.Context) {
	id := c.Param("id")
	_, err := database.Pool.Exec(c, "DELETE FROM dogs WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete dog"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Dog deleted"})
}
