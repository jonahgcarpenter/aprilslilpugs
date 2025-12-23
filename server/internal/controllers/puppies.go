package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
)

func GetPuppies(c *gin.Context) {
	litterID := c.Query("litter_id")

	query := `
		SELECT 
			id, litter_id, name, color, gender, status, description,
			profile_picture, gallery, created_at, updated_at
		FROM puppies`
	
	args := []interface{}{}

	if litterID != "" {
		query += ` WHERE litter_id = $1`
		args = append(args, litterID)
	}

	query += ` ORDER BY status ASC, name ASC`

	rows, err := database.Pool.Query(c, query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch puppies"})
		return
	}
	defer rows.Close()

	var puppies []models.Puppy
	for rows.Next() {
		var p models.Puppy
		var ppRaw, galleryRaw []byte

		if err := rows.Scan(
			&p.ID, &p.LitterID, &p.Name, &p.Color, &p.Gender, &p.Status, &p.Description,
			&ppRaw, &galleryRaw, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			continue
		}

		if len(ppRaw) > 0 { _ = json.Unmarshal(ppRaw, &p.ProfilePicture) }
		
		if len(galleryRaw) > 0 { _ = json.Unmarshal(galleryRaw, &p.Gallery) }
		if p.Gallery == nil { p.Gallery = []models.Image{} }

		puppies = append(puppies, p)
	}

	if puppies == nil { puppies = []models.Puppy{} }
	c.JSON(http.StatusOK, puppies)
}

func GetPuppy(c *gin.Context) {
	id := c.Param("id")
	var p models.Puppy
	var ppRaw, galleryRaw []byte

	query := `
		SELECT 
			id, litter_id, name, color, gender, status, description,
			profile_picture, gallery, created_at, updated_at
		FROM puppies
		WHERE id=$1`

	err := database.Pool.QueryRow(c, query, id).Scan(
		&p.ID, &p.LitterID, &p.Name, &p.Color, &p.Gender, &p.Status, &p.Description,
		&ppRaw, &galleryRaw, &p.CreatedAt, &p.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Puppy not found"})
		return
	}

	if len(ppRaw) > 0 { _ = json.Unmarshal(ppRaw, &p.ProfilePicture) }

	if len(galleryRaw) > 0 { _ = json.Unmarshal(galleryRaw, &p.Gallery) }
	if p.Gallery == nil { p.Gallery = []models.Image{} }

	c.JSON(http.StatusOK, p)
}

func CreatePuppy(c *gin.Context) {
	litterID := parseOptionalID(c.PostForm("litter_id"))
	name := c.PostForm("name")
	color := c.PostForm("color")
	gender := c.PostForm("gender")
	status := c.PostForm("status")
	desc := c.PostForm("description")

	profilePic, _ := utils.UploadAndCreateImage(c, "profile_picture", "puppies")
	ppJSON, _ := json.Marshal(profilePic)

	gallery := []models.Image{}
	for i := 0; i < 50; i++ {
		formKey := fmt.Sprintf("gallery_image_%d", i)
		if img, err := utils.UploadAndCreateImage(c, formKey, "puppies"); err == nil && img != nil {
			descKey := fmt.Sprintf("gallery_description_%d", i)
			img.Description = c.PostForm(descKey)
			
			gallery = append(gallery, *img)
		}
	}
	galleryJSON, _ := json.Marshal(gallery)

	var newID int
	query := `
		INSERT INTO puppies (
			litter_id, name, color, gender, status, description, 
			profile_picture, gallery
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id`
	
	err := database.Pool.QueryRow(c, query, 
		litterID, name, color, gender, status, desc, 
		ppJSON, galleryJSON,
	).Scan(&newID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Puppy created", "id": newID})
}

func UpdatePuppy(c *gin.Context) {
	id := c.Param("id")

	var oldPPRaw, oldGalleryRaw []byte
	err := database.Pool.QueryRow(c, "SELECT profile_picture, gallery FROM puppies WHERE id=$1", id).Scan(&oldPPRaw, &oldGalleryRaw)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Puppy not found"})
		return
	}

	var currentPP *models.Image
	var currentGallery []models.Image
	if len(oldPPRaw) > 0 { _ = json.Unmarshal(oldPPRaw, &currentPP) }
	if len(oldGalleryRaw) > 0 { _ = json.Unmarshal(oldGalleryRaw, &currentGallery) }
	if currentGallery == nil { currentGallery = []models.Image{} }

	litterID := parseOptionalID(c.PostForm("litter_id"))
	name := c.PostForm("name")
	color := c.PostForm("color")
	gender := c.PostForm("gender")
	status := c.PostForm("status")
	desc := c.PostForm("description")

	newPP := currentPP
	if uploadedImg, err := utils.UploadAndCreateImage(c, "profile_picture", "puppies"); err == nil && uploadedImg != nil {
		newPP = uploadedImg
		if currentPP != nil {
			_ = utils.DeleteImage(currentPP.URL)
		}
	}

	existingGalleryJSON := c.PostForm("existing_gallery")
	var processedExistingGallery []models.Image

	if existingGalleryJSON != "" {
		if err := json.Unmarshal([]byte(existingGalleryJSON), &processedExistingGallery); err == nil {
			keepMap := make(map[string]bool)
			for _, img := range processedExistingGallery {
				keepMap[img.URL] = true
			}
			for _, oldImg := range currentGallery {
				if !keepMap[oldImg.URL] {
					_ = utils.DeleteImage(oldImg.URL)
				}
			}
		} else {
			processedExistingGallery = currentGallery
		}
	} else {
		processedExistingGallery = currentGallery
	}

	newGalleryItems := []models.Image{}
	for i := 0; i < 50; i++ {
		formKey := fmt.Sprintf("gallery_image_%d", i)
		if img, err := utils.UploadAndCreateImage(c, formKey, "puppies"); err == nil && img != nil {
			descKey := fmt.Sprintf("gallery_description_%d", i)
			img.Description = c.PostForm(descKey)
			newGalleryItems = append(newGalleryItems, *img)
		}
	}

	finalGallery := append(processedExistingGallery, newGalleryItems...)

	ppJSON, _ := json.Marshal(newPP)
	galleryJSON, _ := json.Marshal(finalGallery)

	query := `
		UPDATE puppies 
		SET litter_id=$1, name=$2, color=$3, gender=$4, status=$5, description=$6, 
			profile_picture=$7, gallery=$8, updated_at=NOW()
		WHERE id=$9`

	_, err = database.Pool.Exec(c, query, 
		litterID, name, color, gender, status, desc, 
		ppJSON, galleryJSON, id,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Puppy updated"})
}

func DeletePuppy(c *gin.Context) {
	id := c.Param("id")

	var ppRaw, galleryRaw []byte
	_ = database.Pool.QueryRow(c, "SELECT profile_picture, gallery FROM puppies WHERE id=$1", id).Scan(&ppRaw, &galleryRaw)

	var pp *models.Image
	var gallery []models.Image
	if len(ppRaw) > 0 { _ = json.Unmarshal(ppRaw, &pp) }
	if len(galleryRaw) > 0 { _ = json.Unmarshal(galleryRaw, &gallery) }

	if pp != nil {
		_ = utils.DeleteImage(pp.URL)
	}
	for _, img := range gallery {
		_ = utils.DeleteImage(img.URL)
	}

	_, err := database.Pool.Exec(c, "DELETE FROM puppies WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete puppy"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Puppy deleted"})
}
