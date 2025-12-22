//go:build ignore
package controllers

import (
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
	if idStr == "" { return nil }
	id, err := strconv.Atoi(idStr)
	if err != nil { return nil }
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
			img.id, img.url, img.alt_text
		FROM litters l
		LEFT JOIN dogs m ON l.mother_id = m.id
		LEFT JOIN dogs f ON l.father_id = f.id
		LEFT JOIN images img ON l.profile_picture_id = img.id
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
		var pID *int
		var pURL, pAlt *string

		err := rows.Scan(
			&l.ID, &l.Name, &l.BirthDate, &l.AvailableDate, &l.Status,
			&l.MotherID, &l.FatherID,
			&extMother, &extFather,
			&mName, &fName,
			&pID, &pURL, &pAlt,
		)
		if err != nil { continue }

		if extMother != nil { l.ExternalMother = *extMother }
		if extFather != nil { l.ExternalFather = *extFather }
		l.MotherName = mName
		l.FatherName = fName

		if pID != nil {
			l.ProfilePicture = &models.Image{ID: *pID, URL: *pURL, AltText: *pAlt}
		}

		galleryQuery := `
			SELECT i.id, i.url, i.alt_text 
			FROM images i
			JOIN litter_gallery lg ON i.id = lg.image_id
			WHERE lg.litter_id = $1
			ORDER BY lg.display_order ASC`

		imgRows, _ := database.Pool.Query(c, galleryQuery, l.ID)
		
		l.Images = []models.Image{}
		
		for imgRows.Next() {
			var img models.Image
			if err := imgRows.Scan(&img.ID, &img.URL, &img.AltText); err == nil {
				l.Images = append(l.Images, img)
			}
		}
		imgRows.Close()

		litters = append(litters, l)
	}
	c.JSON(http.StatusOK, litters)
}

func GetLitter(c *gin.Context) {
	id := c.Param("id")
	var l models.Litter
	var extMother, extFather *string
	var mName, fName string
	var pID *int
	var pURL, pAlt *string

	query := `
		SELECT 
			l.id, l.name, l.birth_date, l.available_date, l.status,
			l.mother_id, l.father_id,
			l.external_mother_name, l.external_father_name,
			COALESCE(m.name, l.external_mother_name, 'Unknown') as mother_display_name,
			COALESCE(f.name, l.external_father_name, 'Unknown') as father_display_name,
			img.id, img.url, img.alt_text
		FROM litters l
		LEFT JOIN dogs m ON l.mother_id = m.id
		LEFT JOIN dogs f ON l.father_id = f.id
		LEFT JOIN images img ON l.profile_picture_id = img.id
		WHERE l.id = $1`

	err := database.Pool.QueryRow(c, query, id).Scan(
		&l.ID, &l.Name, &l.BirthDate, &l.AvailableDate, &l.Status,
		&l.MotherID, &l.FatherID,
		&extMother, &extFather,
		&mName, &fName,
		&pID, &pURL, &pAlt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Litter not found"})
		return
	}

	if extMother != nil { l.ExternalMother = *extMother }
	if extFather != nil { l.ExternalFather = *extFather }
	l.MotherName = mName
	l.FatherName = fName

	if pID != nil {
		l.ProfilePicture = &models.Image{ID: *pID, URL: *pURL, AltText: *pAlt}
	}
	
	galleryQuery := `
		SELECT i.id, i.url, i.alt_text 
		FROM images i
		JOIN litter_gallery lg ON i.id = lg.image_id
		WHERE lg.litter_id = $1
		ORDER BY lg.display_order ASC`

	imgRows, _ := database.Pool.Query(c, galleryQuery, l.ID)
	defer imgRows.Close()

	l.Images = []models.Image{}
	for imgRows.Next() {
		var img models.Image
		if err := imgRows.Scan(&img.ID, &img.URL, &img.AltText); err == nil {
			l.Images = append(l.Images, img)
		}
	}

	c.JSON(http.StatusOK, l)
}

func CreateLitter(c *gin.Context) {
	name := c.PostForm("name")
	status := c.PostForm("status")
	motherID := parseOptionalID(c.PostForm("mother_id"))
	fatherID := parseOptionalID(c.PostForm("father_id"))
	extMother := c.PostForm("external_mother_name")
	extFather := c.PostForm("external_father_name")
	birthDate, _ := time.Parse("2006-01-02", c.PostForm("birth_date"))
	availDate, _ := time.Parse("2006-01-02", c.PostForm("available_date"))

	ppID, _ := utils.UploadAndCreateImage(c, "profile_picture", "litters")
	
	var newID int
	query := `
		INSERT INTO litters (
			name, mother_id, father_id, external_mother_name, external_father_name,
			birth_date, available_date, status, profile_picture_id
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id`

	err := database.Pool.QueryRow(c, query, 
		name, motherID, fatherID, extMother, extFather, 
		birthDate, availDate, status, ppID,
	).Scan(&newID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for i := 0; i < 8; i++ {
		imgID, _ := utils.UploadAndCreateImage(c, fmt.Sprintf("gallery_image_%d", i), "litters")
		if imgID != nil {
			_, _ = database.Pool.Exec(c, 
				"INSERT INTO litter_gallery (litter_id, image_id, display_order) VALUES ($1, $2, $3)", 
				newID, *imgID, i)
		}
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Litter created", "id": newID})
}

func UpdateLitter(c *gin.Context) {
	id := c.Param("id")

	var currentPPID *int
	err := database.Pool.QueryRow(c, "SELECT profile_picture_id FROM litters WHERE id=$1", id).Scan(&currentPPID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Litter not found"})
		return
	}

	name := c.PostForm("name")
	status := c.PostForm("status")
	motherID := parseOptionalID(c.PostForm("mother_id"))
	fatherID := parseOptionalID(c.PostForm("father_id"))
	extMother := c.PostForm("external_mother_name")
	extFather := c.PostForm("external_father_name")
	birthDate, _ := time.Parse("2006-01-02", c.PostForm("birth_date"))
	availDate, _ := time.Parse("2006-01-02", c.PostForm("available_date"))

	newPPID := currentPPID
	if uploadID, _ := utils.UploadAndCreateImage(c, "profile_picture", "litters"); uploadID != nil {
		newPPID = uploadID
	}

	query := `
		UPDATE litters 
		SET name=$1, mother_id=$2, father_id=$3, external_mother_name=$4, external_father_name=$5,
			birth_date=$6, available_date=$7, status=$8, profile_picture_id=$9, updated_at=NOW()
		WHERE id=$10`

	_, err = database.Pool.Exec(c, query, 
		name, motherID, fatherID, extMother, extFather,
		birthDate, availDate, status, newPPID, id,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for i := 0; i < 8; i++ {
		if uploadID, _ := utils.UploadAndCreateImage(c, fmt.Sprintf("gallery_image_%d", i), "litters"); uploadID != nil {
			_, _ = database.Pool.Exec(c, 
				"INSERT INTO litter_gallery (litter_id, image_id, display_order) VALUES ($1, $2, $3)", 
				id, *uploadID, i)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Litter updated"})
}

func DeleteLitter(c *gin.Context) {
	id := c.Param("id")
	_, err := database.Pool.Exec(c, "DELETE FROM litters WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete litter"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Litter deleted"})
}
