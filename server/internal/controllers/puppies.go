package controllers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/lib/pq"
)

func GetPuppies(c *gin.Context) {
	litterID := c.Query("litter_id")

	query := `
		SELECT 
			p.id, p.litter_id, p.name, p.color, p.gender, p.status, p.description, p.image_ids,
			img.id, img.url, img.alt_text
		FROM puppies p
		LEFT JOIN images img ON p.profile_picture_id = img.id`
	
	args := []interface{}{}

	if litterID != "" {
		query += ` WHERE p.litter_id = $1`
		args = append(args, litterID)
	}

	query += ` ORDER BY p.status ASC, p.name ASC`

	rows, err := database.Pool.Query(c, query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch puppies"})
		return
	}
	defer rows.Close()

	var puppies []models.Puppy
	for rows.Next() {
		var p models.Puppy
		var imageIDs []int64
		var pID *int
		var pURL, pAlt *string

		if err := rows.Scan(
			&p.ID, &p.LitterID, &p.Name, &p.Color, &p.Gender, &p.Status, &p.Description, pq.Array(&imageIDs),
			&pID, &pURL, &pAlt,
		); err != nil {
			continue
		}

		if pID != nil {
			p.ProfilePicture = &models.Image{ID: *pID, URL: *pURL, AltText: *pAlt}
		}

		if len(imageIDs) > 0 {
			imgRows, _ := database.Pool.Query(c, "SELECT id, url, alt_text FROM images WHERE id = ANY($1)", pq.Array(imageIDs))
			defer imgRows.Close()
			for imgRows.Next() {
				var img models.Image
				if err := imgRows.Scan(&img.ID, &img.URL, &img.AltText); err == nil {
					p.Images = append(p.Images, img)
				}
			}
		} else {
			p.Images = []models.Image{}
		}

		puppies = append(puppies, p)
	}

	if puppies == nil { puppies = []models.Puppy{} }
	c.JSON(http.StatusOK, puppies)
}

func GetPuppy(c *gin.Context) {
	id := c.Param("id")
	var p models.Puppy
	var imageIDs []int64
	var pID *int
	var pURL, pAlt *string

	query := `
		SELECT 
			p.id, p.litter_id, p.name, p.color, p.gender, p.status, p.description, p.image_ids,
			img.id, img.url, img.alt_text
		FROM puppies p
		LEFT JOIN images img ON p.profile_picture_id = img.id
		WHERE p.id=$1`

	err := database.Pool.QueryRow(c, query, id).Scan(
		&p.ID, &p.LitterID, &p.Name, &p.Color, &p.Gender, &p.Status, &p.Description, pq.Array(&imageIDs),
		&pID, &pURL, &pAlt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Puppy not found"})
		return
	}

	if pID != nil {
		p.ProfilePicture = &models.Image{ID: *pID, URL: *pURL, AltText: *pAlt}
	}

	if len(imageIDs) > 0 {
		imgRows, _ := database.Pool.Query(c, "SELECT id, url, alt_text FROM images WHERE id = ANY($1)", pq.Array(imageIDs))
		defer imgRows.Close()
		for imgRows.Next() {
			var img models.Image
			if err := imgRows.Scan(&img.ID, &img.URL, &img.AltText); err == nil {
				p.Images = append(p.Images, img)
			}
		}
	} else {
		p.Images = []models.Image{}
	}

	c.JSON(http.StatusOK, p)
}

func CreatePuppy(c *gin.Context) {
	litterID := c.PostForm("litter_id")
	name := c.PostForm("name")
	color := c.PostForm("color")
	gender := c.PostForm("gender")
	status := c.PostForm("status")
	desc := c.PostForm("description")

	ppID, _ := utils.UploadAndCreateImage(c, "profile_picture", "puppies")

	var galleryIDs []int
	for i := 0; i < 6; i++ {
		imgID, _ := utils.UploadAndCreateImage(c, fmt.Sprintf("gallery_image_%d", i), "puppies")
		if imgID != nil {
			galleryIDs = append(galleryIDs, *imgID)
		}
	}

	var newID int
	query := `
		INSERT INTO puppies (litter_id, name, color, gender, status, description, profile_picture_id, image_ids)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id`
	
	err := database.Pool.QueryRow(c, query, 
		litterID, name, color, gender, status, desc, ppID, pq.Array(galleryIDs),
	).Scan(&newID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Puppy created", "id": newID})
}

func UpdatePuppy(c *gin.Context) {
	id := c.Param("id")

	var currentPPID *int
	var currentImageIDs []int64
	err := database.Pool.QueryRow(c, "SELECT profile_picture_id, image_ids FROM puppies WHERE id=$1", id).Scan(&currentPPID, pq.Array(&currentImageIDs))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Puppy not found"})
		return
	}

	litterID := c.PostForm("litter_id")
	name := c.PostForm("name")
	color := c.PostForm("color")
	gender := c.PostForm("gender")
	status := c.PostForm("status")
	desc := c.PostForm("description")

	newPPID := currentPPID
	if uploadID, _ := utils.UploadAndCreateImage(c, "profile_picture", "puppies"); uploadID != nil {
		newPPID = uploadID
	}

	newImageIDs := currentImageIDs
	for i := 0; i < 6; i++ {
		if uploadID, _ := utils.UploadAndCreateImage(c, fmt.Sprintf("gallery_image_%d", i), "puppies"); uploadID != nil {
			newImageIDs = append(newImageIDs, int64(*uploadID))
		}
	}

	query := `
		UPDATE puppies 
		SET litter_id=$1, name=$2, color=$3, gender=$4, status=$5, description=$6, profile_picture_id=$7, image_ids=$8, updated_at=NOW()
		WHERE id=$9`

	_, err = database.Pool.Exec(c, query, 
		litterID, name, color, gender, status, desc, newPPID, pq.Array(newImageIDs), id,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Puppy updated"})
}

func DeletePuppy(c *gin.Context) {
	id := c.Param("id")
	_, err := database.Pool.Exec(c, "DELETE FROM puppies WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete puppy"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Puppy deleted"})
}
