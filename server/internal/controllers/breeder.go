package controllers

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
)

func GetBreeder(c *gin.Context) {
	var breeder models.Breeder

	var profilePictureRaw []byte
	var galleryRaw []byte

	query := `
		SELECT 
			id, first_name, last_name, email, phone_number, location, story,
			profile_picture, gallery, created_at, updated_at
		FROM breeders
		ORDER BY id ASC LIMIT 1`

	err := database.Pool.QueryRow(c, query).Scan(
		&breeder.ID, &breeder.FirstName, &breeder.LastName, &breeder.Email,
		&breeder.PhoneNumber, &breeder.Location, &breeder.Story,
		&profilePictureRaw, &galleryRaw,
		&breeder.CreatedAt, &breeder.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			slog.Debug("get breeder: not found", "error", err)
			c.JSON(http.StatusNotFound, gin.H{"error": "Breeder profile not found"})
			return
		}

		slog.Error("get breeder: database error", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch breeder profile"})
		return
	}

	if len(profilePictureRaw) > 0 {
		if err := json.Unmarshal(profilePictureRaw, &breeder.ProfilePicture); err != nil {
			slog.Warn("get breeder: failed to parse profile picture JSON", "error", err)
		}
	}

	if len(galleryRaw) > 0 {
		if err := json.Unmarshal(galleryRaw, &breeder.Gallery); err != nil {
			slog.Warn("get breeder: failed to parse gallery JSON", "error", err)
		}
	}

	if breeder.Gallery == nil {
		breeder.Gallery = []models.Image{}
	}

	c.JSON(http.StatusOK, breeder)
}

func UpdateBreeder(c *gin.Context) {
	var id int
	var oldPPRaw, oldGalleryRaw []byte

	fetchQuery := `SELECT id, profile_picture, gallery FROM breeders ORDER BY id ASC LIMIT 1`
	err := database.Pool.QueryRow(c, fetchQuery).Scan(&id, &oldPPRaw, &oldGalleryRaw)
	if err != nil {
		slog.Debug("update breeder: no breeder profile found", "error", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "No breeder profile to update"})
		return
	}

	var currentPP *models.Image
	var currentGallery []models.Image
	if len(oldPPRaw) > 0 {
		if err := json.Unmarshal(oldPPRaw, &currentPP); err != nil {
			slog.Debug("update breeder: failed to unmarshal current profile picture", "error", err)
		}
	}
	if len(oldGalleryRaw) > 0 {
		if err := json.Unmarshal(oldGalleryRaw, &currentGallery); err != nil {
			slog.Debug("update breeder: failed to unmarshal current gallery", "error", err)
		}
	}

	firstName := c.PostForm("firstName")
	lastName := c.PostForm("lastName")
	email := c.PostForm("email")
	phone := c.PostForm("phoneNumber")
	location := c.PostForm("location")
	story := c.PostForm("story")

	newPP := currentPP

	if uploadedImg, err := utils.UploadAndCreateImage(c, "profilePicture", "breeders"); err == nil && uploadedImg != nil {
		newPP = uploadedImg
		if currentPP != nil && currentPP.URL != "" {
			if err := utils.DeleteImage(currentPP.URL); err != nil {
				slog.Warn("update breeder: failed to delete old profile picture", "url", currentPP.URL, "error", err)
			}
		}
	} else if err != nil {
		slog.Warn("update breeder: failed to process profile picture", "breeder_id", id, "error", err)
	}

	tempGallery := make([]models.Image, 2)
	for i, img := range currentGallery {
		if i < 2 {
			tempGallery[i] = img
		}
	}

	for i := 0; i < 2; i++ {
		formKey := fmt.Sprintf("galleryImage%d", i)

		if uploadedImg, err := utils.UploadAndCreateImage(c, formKey, "breeders"); err == nil && uploadedImg != nil {
			if tempGallery[i].URL != "" {
				if err := utils.DeleteImage(tempGallery[i].URL); err != nil {
					slog.Warn("update breeder: failed to delete old gallery image", "url", tempGallery[i].URL, "error", err)
				}
			}
			tempGallery[i] = *uploadedImg
		} else if err != nil {
			slog.Warn("update breeder: failed to process gallery image", "breeder_id", id, "form_key", formKey, "error", err)
		}
	}

	finalGallery := []models.Image{}
	for _, img := range tempGallery {
		if img.URL != "" {
			finalGallery = append(finalGallery, img)
		}
	}

	ppJSON, err := json.Marshal(newPP)
	if err != nil {
		slog.Warn("update breeder: failed to marshal profile picture", "error", err)
	}
	galleryJSON, err := json.Marshal(finalGallery)
	if err != nil {
		slog.Warn("update breeder: failed to marshal gallery", "error", err)
	}

	updateQuery := `
		UPDATE breeders 
		SET first_name=$1, last_name=$2, email=$3, phone_number=$4, location=$5, story=$6, 
		    profile_picture=$7, gallery=$8, updated_at=NOW()
		WHERE id = $9`

	_, err = database.Pool.Exec(c, updateQuery, firstName, lastName, email, phone, location, story, ppJSON, galleryJSON, id)
	if err != nil {
		slog.Error("update breeder: database error", "id", id, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	slog.Info("update breeder: profile updated", "id", id)
	c.JSON(http.StatusOK, gin.H{"message": "Breeder profile updated successfully"})
}
