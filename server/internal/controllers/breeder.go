package controllers

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
)

func GetBreeder(c *gin.Context) {
	var breeder models.Breeder
	var pID *int
	var pURL, pAlt *string

	query := `
		SELECT 
			b.id, b.first_name, b.last_name, b.email, b.phone_number, b.location, b.story,
			b.created_at, b.updated_at,
			img.id, img.url, img.alt_text
		FROM breeders b
		LEFT JOIN images img ON b.profile_picture_id = img.id
		ORDER BY b.id ASC LIMIT 1`

	err := database.Pool.QueryRow(c, query).Scan(
		&breeder.ID, &breeder.FirstName, &breeder.LastName, &breeder.Email,
		&breeder.PhoneNumber, &breeder.Location, &breeder.Story,
		&breeder.CreatedAt, &breeder.UpdatedAt,
		&pID, &pURL, &pAlt,
	)

	if err != nil {
		fmt.Println("Database error:", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Breeder profile not found"})
		return
	}

	if pID != nil {
		breeder.ProfilePicture = &models.Image{ID: *pID, URL: *pURL, AltText: *pAlt}
		breeder.ProfilePictureID = pID
	}

	galleryQuery := `
		SELECT i.id, i.url, i.alt_text
		FROM breeder_gallery bg
		JOIN images i ON bg.image_id = i.id
		WHERE bg.breeder_id = $1
		ORDER BY bg.display_order ASC`

	rows, err := database.Pool.Query(c, galleryQuery, breeder.ID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var img models.Image
			if err := rows.Scan(&img.ID, &img.URL, &img.AltText); err == nil {
				breeder.Images = append(breeder.Images, img)
			}
		}
	}

	if breeder.Images == nil {
		breeder.Images = []models.Image{}
	}

	c.JSON(http.StatusOK, breeder)
}

func UpdateBreeder(c *gin.Context) {
	var id int
	var currentPPID *int

	err := database.Pool.QueryRow(c, "SELECT id, profile_picture_id FROM breeders ORDER BY id ASC LIMIT 1").Scan(&id, &currentPPID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No breeder profile to update"})
		return
	}

	firstName := c.PostForm("firstName")
	lastName := c.PostForm("lastName")
	email := c.PostForm("email")
	phone := c.PostForm("phoneNumber")
	location := c.PostForm("location")
	story := c.PostForm("story")

	newPPID := currentPPID
	if uploadID, err := utils.UploadAndCreateImage(c, "profilePicture", "breeders"); err == nil && uploadID != nil {
		if currentPPID != nil {
			var oldURL string
			if err := database.Pool.QueryRow(c, "SELECT url FROM images WHERE id=$1", *currentPPID).Scan(&oldURL); err == nil {
				_ = os.Remove("public" + oldURL)
				_, _ = database.Pool.Exec(c, "DELETE FROM images WHERE id=$1", *currentPPID)
			}
		}
		newPPID = uploadID
	}

	updateQuery := `
		UPDATE breeders 
		SET first_name=$1, last_name=$2, email=$3, phone_number=$4, location=$5, story=$6, profile_picture_id=$7, updated_at=NOW()
		WHERE id = $8`

	_, err = database.Pool.Exec(c, updateQuery, firstName, lastName, email, phone, location, story, newPPID, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	currentGalleryMap := make(map[int]int)
	gRows, err := database.Pool.Query(c, "SELECT image_id, display_order FROM breeder_gallery WHERE breeder_id=$1", id)
	if err == nil {
		defer gRows.Close()
		for gRows.Next() {
			var imgID, dispOrder int
			if err := gRows.Scan(&imgID, &dispOrder); err == nil {
				currentGalleryMap[dispOrder] = imgID
			}
		}
	}

	for i := 0; i < 4; i++ {
		formKey := fmt.Sprintf("galleryImage%d", i)
		if uploadID, err := utils.UploadAndCreateImage(c, formKey, "breeders"); err == nil && uploadID != nil {
			newImageID := *uploadID

			if oldID, exists := currentGalleryMap[i]; exists {
				var oldURL string
				if err := database.Pool.QueryRow(c, "SELECT url FROM images WHERE id=$1", oldID).Scan(&oldURL); err == nil {
					_ = os.Remove("public" + oldURL)
					_, _ = database.Pool.Exec(c, "DELETE FROM images WHERE id=$1", oldID)
				}
			}

			_, _ = database.Pool.Exec(c, 
				"INSERT INTO breeder_gallery (breeder_id, image_id, display_order) VALUES ($1, $2, $3)", 
				id, newImageID, i)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Breeder profile updated successfully"})
}
