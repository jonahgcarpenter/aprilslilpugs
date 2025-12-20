package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/lib/pq"
)

func GetDogs(c *gin.Context) {
	query := `
		SELECT 
			d.id, d.name, d.gender, d.description, d.birth_date, d.image_ids,
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
		var imageIDs []int64
		
		var pID *int
		var pURL, pAlt *string

		if err := rows.Scan(
			&dog.ID, &dog.Name, &dog.Gender, &dog.Description, &dog.BirthDate, pq.Array(&imageIDs),
			&pID, &pURL, &pAlt,
		); err != nil {
			continue
		}

		if pID != nil {
			dog.ProfilePicture = &models.Image{ID: *pID, URL: *pURL, AltText: *pAlt}
		}

		if len(imageIDs) > 0 {
			imgRows, _ := database.Pool.Query(c, "SELECT id, url, alt_text FROM images WHERE id = ANY($1)", pq.Array(imageIDs))
			defer imgRows.Close()
			for imgRows.Next() {
				var img models.Image
				if err := imgRows.Scan(&img.ID, &img.URL, &img.AltText); err == nil {
					dog.Images = append(dog.Images, img)
				}
			}
		} else {
			dog.Images = []models.Image{}
		}

		dogs = append(dogs, dog)
	}

	c.JSON(http.StatusOK, dogs)
}

func GetDog(c *gin.Context) {
	id := c.Param("id")
	var dog models.Dog
	var imageIDs []int64
	var pID *int
	var pURL, pAlt *string

	query := `
		SELECT 
			d.id, d.name, d.gender, d.description, d.birth_date, d.image_ids,
			img.id, img.url, img.alt_text 
		FROM dogs d
		LEFT JOIN images img ON d.profile_picture_id = img.id
		WHERE d.id=$1`

	err := database.Pool.QueryRow(c, query, id).Scan(
		&dog.ID, &dog.Name, &dog.Gender, &dog.Description, &dog.BirthDate, pq.Array(&imageIDs),
		&pID, &pURL, &pAlt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dog not found"})
		return
	}

	if pID != nil {
		dog.ProfilePicture = &models.Image{ID: *pID, URL: *pURL, AltText: *pAlt}
	}

	if len(imageIDs) > 0 {
		imgRows, _ := database.Pool.Query(c, "SELECT id, url, alt_text FROM images WHERE id = ANY($1)", pq.Array(imageIDs))
		defer imgRows.Close()
		for imgRows.Next() {
			var img models.Image
			if err := imgRows.Scan(&img.ID, &img.URL, &img.AltText); err == nil {
				dog.Images = append(dog.Images, img)
			}
		}
	} else {
		dog.Images = []models.Image{}
	}

	c.JSON(http.StatusOK, dog)
}

func CreateDog(c *gin.Context) {
	profilePicID, err := utils.UploadAndCreateImage(c, "profilePicture", "dogs")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload profile picture"})
		return
	}

	var galleryIDs []int
	for i := 0; i < 5; i++ {
		formKey := fmt.Sprintf("galleryImage%d", i)
		imgID, _ := utils.UploadAndCreateImage(c, formKey, "dogs")
		if imgID != nil {
			galleryIDs = append(galleryIDs, *imgID)
		}
	}

	name := c.PostForm("name")
	gender := c.PostForm("gender")
	desc := c.PostForm("description")
	birthDate, _ := time.Parse("2006-01-02", c.PostForm("birthDate"))

	var dogID int
	query := `
		INSERT INTO dogs (name, gender, description, birth_date, profile_picture_id, image_ids)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
	
	err = database.Pool.QueryRow(c, query, 
		name, gender, desc, birthDate, profilePicID, pq.Array(galleryIDs),
	).Scan(&dogID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Dog created", "dogId": dogID})
}

func UpdateDog(c *gin.Context) {
	id := c.Param("id")
	
	var currentPPID *int
	var currentImageIDs []int64
	err := database.Pool.QueryRow(c, "SELECT profile_picture_id, image_ids FROM dogs WHERE id=$1", id).Scan(&currentPPID, pq.Array(&currentImageIDs))
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
	}

	newImageIDs := currentImageIDs
	for i := 0; i < 5; i++ {
		formKey := fmt.Sprintf("galleryImage%d", i)
		imgID, _ := utils.UploadAndCreateImage(c, formKey, "dogs")
		if imgID != nil {
			newImageIDs = append(newImageIDs, int64(*imgID))
		}
	}

	_, err = database.Pool.Exec(c, `
		UPDATE dogs SET name=$1, gender=$2, description=$3, birth_date=$4, profile_picture_id=$5, image_ids=$6, updated_at=NOW()
		WHERE id=$7`, 
		name, gender, desc, birthDate, newPPID, pq.Array(newImageIDs), id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
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
