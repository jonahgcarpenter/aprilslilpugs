package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
)

func parseOptionalID(idStr string) *int {
	if idStr == "" {
		return nil
	}
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return nil
	}
	return &id
}

func GetLitters(c *gin.Context) {
	query := `
		SELECT 
			l.id, l.name, l.birth_date, l.available_date, l.status,
			l.mother_id, l.father_id,
			l.external_mother_name, l.external_father_name,
			COALESCE(m.name, l.external_mother_name, 'Unknown') as mother_display_name,
			COALESCE(f.name, l.external_father_name, 'Unknown') as father_display_name,
			l.profile_picture, l.gallery, l.created_at, l.updated_at
		FROM litters l
		LEFT JOIN dogs m ON l.mother_id = m.id
		LEFT JOIN dogs f ON l.father_id = f.id
		ORDER BY l.created_at DESC`

	rows, err := database.Pool.Query(c, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch litters"})
		return
	}
	defer rows.Close()

	var litters []models.Litter
	for rows.Next() {
		var l models.Litter
		var extMother, extFather *string
		var mName, fName string
		var ppRaw, galleryRaw []byte

		err := rows.Scan(
			&l.ID, &l.Name, &l.BirthDate, &l.AvailableDate, &l.Status,
			&l.MotherID, &l.FatherID,
			&extMother, &extFather,
			&mName, &fName,
			&ppRaw, &galleryRaw, &l.CreatedAt, &l.UpdatedAt,
		)
		if err != nil {
			continue
		}

		if extMother != nil { l.ExternalMother = *extMother }
		if extFather != nil { l.ExternalFather = *extFather }
		l.MotherName = mName
		l.FatherName = fName

		if len(ppRaw) > 0 { _ = json.Unmarshal(ppRaw, &l.ProfilePicture) }
		if len(galleryRaw) > 0 { _ = json.Unmarshal(galleryRaw, &l.Gallery) }
		if l.Gallery == nil { l.Gallery = []models.Image{} }

		litters = append(litters, l)
	}
	c.JSON(http.StatusOK, litters)
}

func GetLitter(c *gin.Context) {
	id := c.Param("id")
	var l models.Litter
	var extMother, extFather *string
	var mName, fName string
	var ppRaw, galleryRaw []byte

	query := `
		SELECT 
			l.id, l.name, l.birth_date, l.available_date, l.status,
			l.mother_id, l.father_id,
			l.external_mother_name, l.external_father_name,
			COALESCE(m.name, l.external_mother_name, 'Unknown') as mother_display_name,
			COALESCE(f.name, l.external_father_name, 'Unknown') as father_display_name,
			l.profile_picture, l.gallery, l.created_at, l.updated_at
		FROM litters l
		LEFT JOIN dogs m ON l.mother_id = m.id
		LEFT JOIN dogs f ON l.father_id = f.id
		WHERE l.id = $1`

	err := database.Pool.QueryRow(c, query, id).Scan(
		&l.ID, &l.Name, &l.BirthDate, &l.AvailableDate, &l.Status,
		&l.MotherID, &l.FatherID,
		&extMother, &extFather,
		&mName, &fName,
		&ppRaw, &galleryRaw, &l.CreatedAt, &l.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Litter not found"})
		return
	}

	if extMother != nil { l.ExternalMother = *extMother }
	if extFather != nil { l.ExternalFather = *extFather }
	l.MotherName = mName
	l.FatherName = fName

	if len(ppRaw) > 0 { _ = json.Unmarshal(ppRaw, &l.ProfilePicture) }
	if len(galleryRaw) > 0 { _ = json.Unmarshal(galleryRaw, &l.Gallery) }
	if l.Gallery == nil { l.Gallery = []models.Image{} }

	c.JSON(http.StatusOK, l)
}

func CreateLitter(c *gin.Context) {
	profilePic, _ := utils.UploadAndCreateImage(c, "profile_picture", "litters")

	gallery := []models.Image{}
	for i := 0; i < 50; i++ {
		formKey := fmt.Sprintf("gallery_image_%d", i)
		img, err := utils.UploadAndCreateImage(c, formKey, "litters")

		if err == nil && img != nil {
			descKey := fmt.Sprintf("gallery_description_%d", i)
			img.Description = c.PostForm(descKey)

			gallery = append(gallery, *img)
		}
	}

	name := c.PostForm("name")
	status := c.PostForm("status")
	motherID := parseOptionalID(c.PostForm("mother_id"))
	fatherID := parseOptionalID(c.PostForm("father_id"))
	extMother := c.PostForm("external_mother_name")
	extFather := c.PostForm("external_father_name")
	birthDate, _ := time.Parse("2006-01-02", c.PostForm("birth_date"))
	availDate, _ := time.Parse("2006-01-02", c.PostForm("available_date"))

	ppJSON, _ := json.Marshal(profilePic)
	galleryJSON, _ := json.Marshal(gallery)

	var newID int
	query := `
		INSERT INTO litters (
			name, mother_id, father_id, external_mother_name, external_father_name,
			birth_date, available_date, status, profile_picture, gallery
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id`

	err := database.Pool.QueryRow(c, query,
		name, motherID, fatherID, extMother, extFather,
		birthDate, availDate, status, ppJSON, galleryJSON,
	).Scan(&newID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Litter created", "id": newID})
}

func UpdateLitter(c *gin.Context) {
	id := c.Param("id")

	var oldPPRaw, oldGalleryRaw []byte
	err := database.Pool.QueryRow(c, "SELECT profile_picture, gallery FROM litters WHERE id=$1", id).Scan(&oldPPRaw, &oldGalleryRaw)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Litter not found"})
		return
	}

	var currentPP *models.Image
	var currentGallery []models.Image
	if len(oldPPRaw) > 0 { _ = json.Unmarshal(oldPPRaw, &currentPP) }
	if len(oldGalleryRaw) > 0 { _ = json.Unmarshal(oldGalleryRaw, &currentGallery) }
	if currentGallery == nil { currentGallery = []models.Image{} }

	name := c.PostForm("name")
	status := c.PostForm("status")
	motherID := parseOptionalID(c.PostForm("mother_id"))
	fatherID := parseOptionalID(c.PostForm("father_id"))
	extMother := c.PostForm("external_mother_name")
	extFather := c.PostForm("external_father_name")
	birthDate, _ := time.Parse("2006-01-02", c.PostForm("birth_date"))
	availDate, _ := time.Parse("2006-01-02", c.PostForm("available_date"))

	newPP := currentPP
	if uploadedImg, err := utils.UploadAndCreateImage(c, "profile_picture", "litters"); err == nil && uploadedImg != nil {
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
		if img, err := utils.UploadAndCreateImage(c, formKey, "litters"); err == nil && img != nil {
			descKey := fmt.Sprintf("gallery_description_%d", i)
			img.Description = c.PostForm(descKey)
			
			newGalleryItems = append(newGalleryItems, *img)
		}
	}

	finalGallery := append(processedExistingGallery, newGalleryItems...)

	ppJSON, _ := json.Marshal(newPP)
	galleryJSON, _ := json.Marshal(finalGallery)

	query := `
		UPDATE litters 
		SET name=$1, mother_id=$2, father_id=$3, external_mother_name=$4, external_father_name=$5,
			birth_date=$6, available_date=$7, status=$8, profile_picture=$9, gallery=$10, updated_at=NOW()
		WHERE id=$11`

	_, err = database.Pool.Exec(c, query,
		name, motherID, fatherID, extMother, extFather,
		birthDate, availDate, status, ppJSON, galleryJSON, id,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Litter updated successfully"})
}

func DeleteLitter(c *gin.Context) {
	id := c.Param("id")

	var ppRaw, galleryRaw []byte
	_ = database.Pool.QueryRow(c, "SELECT profile_picture, gallery FROM litters WHERE id=$1", id).Scan(&ppRaw, &galleryRaw)

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

	_, err := database.Pool.Exec(c, "DELETE FROM litters WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete litter"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Litter deleted"})
}
