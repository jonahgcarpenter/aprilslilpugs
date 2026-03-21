package controllers

import (
	"encoding/json"
	"fmt"
	"log/slog"
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
		slog.Error("get puppies: database error", "error", err)
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
			slog.Debug("get puppies: failed to scan row", "error", err)
			continue
		}

		if len(ppRaw) > 0 {
			if err := json.Unmarshal(ppRaw, &p.ProfilePicture); err != nil {
				slog.Debug("get puppies: failed to unmarshal profile picture", "puppy_id", p.ID, "error", err)
			}
		}
		if len(galleryRaw) > 0 {
			if err := json.Unmarshal(galleryRaw, &p.Gallery); err != nil {
				slog.Debug("get puppies: failed to unmarshal gallery", "puppy_id", p.ID, "error", err)
			}
		}
		if p.Gallery == nil {
			p.Gallery = []models.Image{}
		}

		puppies = append(puppies, p)
	}

	if puppies == nil {
		puppies = []models.Puppy{}
	}
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
		slog.Debug("get puppy: not found", "id", id, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Puppy not found"})
		return
	}

	if len(ppRaw) > 0 {
		if err := json.Unmarshal(ppRaw, &p.ProfilePicture); err != nil {
			slog.Debug("get puppy: failed to unmarshal profile picture", "puppy_id", id, "error", err)
		}
	}
	if len(galleryRaw) > 0 {
		if err := json.Unmarshal(galleryRaw, &p.Gallery); err != nil {
			slog.Debug("get puppy: failed to unmarshal gallery", "puppy_id", id, "error", err)
		}
	}
	if p.Gallery == nil {
		p.Gallery = []models.Image{}
	}

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
	ppJSON, err := json.Marshal(profilePic)
	if err != nil {
		slog.Warn("create puppy: failed to marshal profile picture", "error", err)
	}

	gallery := []models.Image{}
	for i := 0; i < 50; i++ {
		formKey := fmt.Sprintf("gallery_image_%d", i)
		if img, err := utils.UploadAndCreateImage(c, formKey, "puppies"); err == nil && img != nil {
			descKey := fmt.Sprintf("gallery_description_%d", i)
			img.Description = c.PostForm(descKey)
			gallery = append(gallery, *img)
		}
	}
	galleryJSON, err := json.Marshal(gallery)
	if err != nil {
		slog.Warn("create puppy: failed to marshal gallery", "error", err)
	}

	var newID int
	query := `
		INSERT INTO puppies (
			litter_id, name, color, gender, status, description, 
			profile_picture, gallery
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id`

	err = database.Pool.QueryRow(c, query,
		litterID, name, color, gender, status, desc,
		ppJSON, galleryJSON,
	).Scan(&newID)

	if err != nil {
		slog.Error("create puppy: database error", "name", name, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if litterID != nil {
		updateLitterStatus(c, *litterID)
	}

	slog.Info("create puppy: puppy created", "puppy_id", newID, "name", name)
	c.JSON(http.StatusCreated, gin.H{"message": "Puppy created", "id": newID})
}

func UpdatePuppy(c *gin.Context) {
	id := c.Param("id")

	var oldLitterID *int
	var oldPPRaw, oldGalleryRaw []byte
	err := database.Pool.QueryRow(c, "SELECT litter_id, profile_picture, gallery FROM puppies WHERE id=$1", id).Scan(&oldLitterID, &oldPPRaw, &oldGalleryRaw)
	if err != nil {
		slog.Debug("update puppy: not found", "id", id, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Puppy not found"})
		return
	}

	var currentPP *models.Image
	var currentGallery []models.Image
	if len(oldPPRaw) > 0 {
		if err := json.Unmarshal(oldPPRaw, &currentPP); err != nil {
			slog.Debug("update puppy: failed to unmarshal current profile picture", "puppy_id", id, "error", err)
		}
	}
	if len(oldGalleryRaw) > 0 {
		if err := json.Unmarshal(oldGalleryRaw, &currentGallery); err != nil {
			slog.Debug("update puppy: failed to unmarshal current gallery", "puppy_id", id, "error", err)
		}
	}
	if currentGallery == nil {
		currentGallery = []models.Image{}
	}

	var litterID *int
	if val, ok := c.GetPostForm("litter_id"); ok {
		litterID = parseOptionalID(val)
	} else {
		litterID = oldLitterID
	}

	name := c.PostForm("name")
	color := c.PostForm("color")
	gender := c.PostForm("gender")
	status := c.PostForm("status")
	desc := c.PostForm("description")

	newPP := currentPP
	if uploadedImg, err := utils.UploadAndCreateImage(c, "profile_picture", "puppies"); err == nil && uploadedImg != nil {
		newPP = uploadedImg
		if currentPP != nil {
			if err := utils.DeleteImage(currentPP.URL); err != nil {
				slog.Warn("update puppy: failed to delete old profile picture", "url", currentPP.URL, "error", err)
			}
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
					if err := utils.DeleteImage(oldImg.URL); err != nil {
						slog.Warn("update puppy: failed to delete removed gallery image", "url", oldImg.URL, "error", err)
					}
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

	ppJSON, err := json.Marshal(newPP)
	if err != nil {
		slog.Warn("update puppy: failed to marshal profile picture", "puppy_id", id, "error", err)
	}
	galleryJSON, err := json.Marshal(finalGallery)
	if err != nil {
		slog.Warn("update puppy: failed to marshal gallery", "puppy_id", id, "error", err)
	}

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
		slog.Error("update puppy: database error", "id", id, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if oldLitterID != nil {
		updateLitterStatus(c, *oldLitterID)
	}

	if litterID != nil {
		if oldLitterID == nil || *litterID != *oldLitterID {
			updateLitterStatus(c, *litterID)
		}
	}

	slog.Info("update puppy: puppy updated", "puppy_id", id)
	c.JSON(http.StatusOK, gin.H{"message": "Puppy updated"})
}

func DeletePuppy(c *gin.Context) {
	id := c.Param("id")

	var litterID *int
	var ppRaw, galleryRaw []byte
	if err := database.Pool.QueryRow(c, "SELECT litter_id, profile_picture, gallery FROM puppies WHERE id=$1", id).Scan(&litterID, &ppRaw, &galleryRaw); err != nil {
		slog.Warn("delete puppy: failed to fetch images before delete", "id", id, "error", err)
	}

	var pp *models.Image
	var gallery []models.Image
	if len(ppRaw) > 0 {
		if err := json.Unmarshal(ppRaw, &pp); err != nil {
			slog.Debug("delete puppy: failed to unmarshal profile picture", "puppy_id", id, "error", err)
		}
	}
	if len(galleryRaw) > 0 {
		if err := json.Unmarshal(galleryRaw, &gallery); err != nil {
			slog.Debug("delete puppy: failed to unmarshal gallery", "puppy_id", id, "error", err)
		}
	}

	if pp != nil {
		if err := utils.DeleteImage(pp.URL); err != nil {
			slog.Warn("delete puppy: failed to delete profile picture file", "url", pp.URL, "error", err)
		}
	}
	for _, img := range gallery {
		if err := utils.DeleteImage(img.URL); err != nil {
			slog.Warn("delete puppy: failed to delete gallery image file", "url", img.URL, "error", err)
		}
	}

	_, err := database.Pool.Exec(c, "DELETE FROM puppies WHERE id=$1", id)
	if err != nil {
		slog.Error("delete puppy: database error", "id", id, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete puppy"})
		return
	}

	if litterID != nil {
		updateLitterStatus(c, *litterID)
	}

	slog.Info("delete puppy: puppy deleted", "puppy_id", id)
	c.JSON(http.StatusOK, gin.H{"message": "Puppy deleted"})
}

func updateLitterStatus(c *gin.Context, litterID int) {
	var total, notSold int
	query := `
		SELECT 
			count(*),
			count(*) filter (where status != 'Sold')
		FROM puppies 
		WHERE litter_id = $1`

	err := database.Pool.QueryRow(c, query, litterID).Scan(&total, &notSold)
	if err != nil {
		slog.Error("update litter status: failed to count puppies", "litter_id", litterID, "error", err)
		return
	}

	if total == 0 {
		return
	}

	var newStatus string
	if notSold == 0 {
		newStatus = "Sold"
	} else {
		newStatus = "Available"
	}

	if _, err := database.Pool.Exec(c, "UPDATE litters SET status = $1 WHERE id = $2", newStatus, litterID); err != nil {
		slog.Error("update litter status: failed to update status", "litter_id", litterID, "new_status", newStatus, "error", err)
	} else {
		slog.Debug("update litter status: status updated", "litter_id", litterID, "new_status", newStatus)
	}
}
