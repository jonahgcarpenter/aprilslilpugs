package controllers

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
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
		slog.Error("get dogs: database error", "error", err)
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
			slog.Debug("get dogs: failed to scan row", "error", err)
			continue
		}

		if len(ppRaw) > 0 {
			if err := json.Unmarshal(ppRaw, &dog.ProfilePicture); err != nil {
				slog.Debug("get dogs: failed to unmarshal profile picture", "dog_id", dog.ID, "error", err)
			}
		}
		if len(galleryRaw) > 0 {
			if err := json.Unmarshal(galleryRaw, &dog.Gallery); err != nil {
				slog.Debug("get dogs: failed to unmarshal gallery", "dog_id", dog.ID, "error", err)
			}
		}
		if dog.Gallery == nil {
			dog.Gallery = []models.Image{}
		}

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
		slog.Debug("get dog: not found", "id", id, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Dog not found"})
		return
	}

	if len(ppRaw) > 0 {
		if err := json.Unmarshal(ppRaw, &dog.ProfilePicture); err != nil {
			slog.Debug("get dog: failed to unmarshal profile picture", "dog_id", id, "error", err)
		}
	}
	if len(galleryRaw) > 0 {
		if err := json.Unmarshal(galleryRaw, &dog.Gallery); err != nil {
			slog.Debug("get dog: failed to unmarshal gallery", "dog_id", id, "error", err)
		}
	}
	if dog.Gallery == nil {
		dog.Gallery = []models.Image{}
	}

	c.JSON(http.StatusOK, dog)
}

func CreateDog(c *gin.Context) {
	profilePic, err := utils.UploadAndCreateImage(c, "profilePicture", "dogs")
	if err != nil {
		slog.Warn("create dog: failed to process profile picture", "error", err)
	}

	gallery := []models.Image{}
	for i := 0; i < 50; i++ {
		formKey := fmt.Sprintf("galleryImage%d", i)
		img, err := utils.UploadAndCreateImage(c, formKey, "dogs")

		if err == nil && img != nil {
			descKey := fmt.Sprintf("galleryDescription%d", i)
			img.Description = c.PostForm(descKey)
			gallery = append(gallery, *img)
		} else if err != nil {
			slog.Warn("create dog: failed to process gallery image", "form_key", formKey, "error", err)
		}
	}

	name := c.PostForm("name")
	gender := c.PostForm("gender")
	desc := c.PostForm("description")
	birthDate, _ := time.Parse("2006-01-02", c.PostForm("birthDate"))

	ppJSON, err := json.Marshal(profilePic)
	if err != nil {
		slog.Warn("create dog: failed to marshal profile picture", "error", err)
	}
	galleryJSON, err := json.Marshal(gallery)
	if err != nil {
		slog.Warn("create dog: failed to marshal gallery", "error", err)
	}

	var dogID int
	query := `
		INSERT INTO dogs (name, gender, description, birth_date, profile_picture, gallery)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`

	err = database.Pool.QueryRow(c, query, name, gender, desc, birthDate, ppJSON, galleryJSON).Scan(&dogID)
	if err != nil {
		slog.Error("create dog: database error", "name", name, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	slog.Info("create dog: dog created", "dog_id", dogID, "name", name)
	c.JSON(http.StatusCreated, gin.H{"message": "Dog created", "dogId": dogID})
}

func UpdateDog(c *gin.Context) {
	id := c.Param("id")

	var oldPPRaw, oldGalleryRaw []byte
	err := database.Pool.QueryRow(c, "SELECT profile_picture, gallery FROM dogs WHERE id=$1", id).Scan(&oldPPRaw, &oldGalleryRaw)
	if err != nil {
		slog.Debug("update dog: not found", "id", id, "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Dog not found"})
		return
	}

	var currentPP *models.Image
	var currentGallery []models.Image
	if len(oldPPRaw) > 0 {
		if err := json.Unmarshal(oldPPRaw, &currentPP); err != nil {
			slog.Debug("update dog: failed to unmarshal current profile picture", "dog_id", id, "error", err)
		}
	}
	if len(oldGalleryRaw) > 0 {
		if err := json.Unmarshal(oldGalleryRaw, &currentGallery); err != nil {
			slog.Debug("update dog: failed to unmarshal current gallery", "dog_id", id, "error", err)
		}
	}
	if currentGallery == nil {
		currentGallery = []models.Image{}
	}

	name := c.PostForm("name")
	gender := c.PostForm("gender")
	desc := c.PostForm("description")
	birthDate, _ := time.Parse("2006-01-02", c.PostForm("birthDate"))

	newPP := currentPP
	if uploadedImg, err := utils.UploadAndCreateImage(c, "profilePicture", "dogs"); err == nil && uploadedImg != nil {
		newPP = uploadedImg
		if currentPP != nil {
			if err := utils.DeleteImage(currentPP.URL); err != nil {
				slog.Warn("update dog: failed to delete old profile picture", "url", currentPP.URL, "error", err)
			}
		}
	} else if err != nil {
		slog.Warn("update dog: failed to process profile picture", "dog_id", id, "error", err)
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
						slog.Warn("update dog: failed to delete removed gallery image", "url", oldImg.URL, "error", err)
					}
				}
			}
		} else {
			slog.Warn("update dog: invalid existing gallery payload", "dog_id", id, "error", err)
			processedExistingGallery = currentGallery
		}
	} else {
		processedExistingGallery = currentGallery
	}

	newGalleryItems := []models.Image{}
	for i := 0; i < 50; i++ {
		formKey := fmt.Sprintf("galleryImage%d", i)
		if img, err := utils.UploadAndCreateImage(c, formKey, "dogs"); err == nil && img != nil {
			descKey := fmt.Sprintf("galleryDescription%d", i)
			img.Description = c.PostForm(descKey)
			newGalleryItems = append(newGalleryItems, *img)
		} else if err != nil {
			slog.Warn("update dog: failed to process gallery image", "dog_id", id, "form_key", formKey, "error", err)
		}
	}

	finalGallery := append(processedExistingGallery, newGalleryItems...)

	ppJSON, err := json.Marshal(newPP)
	if err != nil {
		slog.Warn("update dog: failed to marshal profile picture", "dog_id", id, "error", err)
	}
	galleryJSON, err := json.Marshal(finalGallery)
	if err != nil {
		slog.Warn("update dog: failed to marshal gallery", "dog_id", id, "error", err)
	}

	_, err = database.Pool.Exec(c, `
		UPDATE dogs SET name=$1, gender=$2, description=$3, birth_date=$4, profile_picture=$5, gallery=$6, updated_at=NOW()
		WHERE id=$7`,
		name, gender, desc, birthDate, ppJSON, galleryJSON, id)

	if err != nil {
		slog.Error("update dog: database error", "id", id, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	slog.Info("update dog: dog updated", "dog_id", id)
	c.JSON(http.StatusOK, gin.H{"message": "Dog updated successfully"})
}

func DeleteDog(c *gin.Context) {
	id := c.Param("id")

	var ppRaw, galleryRaw []byte
	if err := database.Pool.QueryRow(c, "SELECT profile_picture, gallery FROM dogs WHERE id=$1", id).Scan(&ppRaw, &galleryRaw); err != nil {
		if err == pgx.ErrNoRows {
			slog.Debug("delete dog: not found before cleanup", "id", id)
		} else {
			slog.Error("delete dog: failed to fetch images before delete", "id", id, "error", err)
		}
	}

	var pp *models.Image
	var gallery []models.Image
	if len(ppRaw) > 0 {
		if err := json.Unmarshal(ppRaw, &pp); err != nil {
			slog.Debug("delete dog: failed to unmarshal profile picture", "dog_id", id, "error", err)
		}
	}
	if len(galleryRaw) > 0 {
		if err := json.Unmarshal(galleryRaw, &gallery); err != nil {
			slog.Debug("delete dog: failed to unmarshal gallery", "dog_id", id, "error", err)
		}
	}

	if pp != nil {
		if err := utils.DeleteImage(pp.URL); err != nil {
			slog.Warn("delete dog: failed to delete profile picture file", "url", pp.URL, "error", err)
		}
	}
	for _, img := range gallery {
		if err := utils.DeleteImage(img.URL); err != nil {
			slog.Warn("delete dog: failed to delete gallery image file", "url", img.URL, "error", err)
		}
	}

	_, err := database.Pool.Exec(c, "DELETE FROM dogs WHERE id=$1", id)
	if err != nil {
		slog.Error("delete dog: database error", "id", id, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete dog"})
		return
	}

	slog.Info("delete dog: dog deleted", "dog_id", id)
	c.JSON(http.StatusOK, gin.H{"message": "Dog deleted"})
}
