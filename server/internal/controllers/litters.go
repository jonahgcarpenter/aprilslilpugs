package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
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

func formatLitterImages(litter *models.Litter) {
	if litter.ProfilePicture != "" {
		litter.ProfilePicture = "/uploads/litters/" + litter.ProfilePicture
	}
	for i, img := range litter.Images {
		if img != "" {
			litter.Images[i] = "/uploads/litters/" + img
		}
	}
}

func GetLitters(c *gin.Context) {
	query := `
		SELECT 
			l.id, l.name, l.birth_date, l.available_date, l.status, l.profile_picture, l.images,
			l.mother_id, l.father_id,
			l.external_mother_name, l.external_father_name,
			COALESCE(m.name, l.external_mother_name, 'Unknown') as mother_display_name,
			COALESCE(f.name, l.external_father_name, 'Unknown') as father_display_name
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

		err := rows.Scan(
			&l.ID, &l.Name, &l.BirthDate, &l.AvailableDate, &l.Status, &l.ProfilePicture, &l.Images,
			&l.MotherID, &l.FatherID,
			&extMother, &extFather,
			&mName, &fName,
		)
		if err != nil {
			continue
		}

		if extMother != nil { l.ExternalMother = *extMother }
		if extFather != nil { l.ExternalFather = *extFather }
		l.MotherName = mName
		l.FatherName = fName

		formatLitterImages(&l)
		litters = append(litters, l)
	}

	c.JSON(http.StatusOK, litters)
}

func GetLitter(c *gin.Context) {
	id := c.Param("id")
	var l models.Litter
	
	var extMother, extFather *string
	var mName, fName string

	query := `
		SELECT 
			l.id, l.name, l.birth_date, l.available_date, l.status, l.profile_picture, l.images,
			l.mother_id, l.father_id,
			l.external_mother_name, l.external_father_name,
			COALESCE(m.name, l.external_mother_name, 'Unknown') as mother_display_name,
			COALESCE(f.name, l.external_father_name, 'Unknown') as father_display_name
		FROM litters l
		LEFT JOIN dogs m ON l.mother_id = m.id
		LEFT JOIN dogs f ON l.father_id = f.id
		WHERE l.id = $1`

	err := database.Pool.QueryRow(c, query, id).Scan(
		&l.ID, &l.Name, &l.BirthDate, &l.AvailableDate, &l.Status, &l.ProfilePicture, &l.Images,
		&l.MotherID, &l.FatherID,
		&extMother, &extFather,
		&mName, &fName,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Litter not found"})
		return
	}

	if extMother != nil { l.ExternalMother = *extMother }
	if extFather != nil { l.ExternalFather = *extFather }
	l.MotherName = mName
	l.FatherName = fName

	formatLitterImages(&l)

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

	var profilePic string
	file, err := c.FormFile("profile_picture")
	if err == nil {
		filename := fmt.Sprintf("%d-%s", time.Now().Unix(), file.Filename)
		c.SaveUploadedFile(file, filepath.Join("public/uploads/litters", filename))
		profilePic = filename
	}

	var images []string
	for i := 0; i < 8; i++ {
		gFile, err := c.FormFile(fmt.Sprintf("gallery_image_%d", i))
		if err == nil {
			filename := fmt.Sprintf("%d-litter-%d-%s", time.Now().Unix(), i, gFile.Filename)
			c.SaveUploadedFile(gFile, filepath.Join("public/uploads/litters", filename))
			images = append(images, filename)
		}
	}
	if images == nil { images = []string{} }

	var newID int
	query := `
		INSERT INTO litters (
			name, mother_id, father_id, external_mother_name, external_father_name,
			birth_date, available_date, status, profile_picture, images
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id`

	err = database.Pool.QueryRow(c, query, 
		name, motherID, fatherID, extMother, extFather, 
		birthDate, availDate, status, profilePic, images,
	).Scan(&newID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Litter created", "id": newID})
}

func UpdateLitter(c *gin.Context) {
	id := c.Param("id")

	var current models.Litter
	err := database.Pool.QueryRow(c, "SELECT profile_picture, images FROM litters WHERE id=$1", id).Scan(&current.ProfilePicture, &current.Images)
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

	newProfilePic := current.ProfilePicture
	file, err := c.FormFile("profile_picture")
	if err == nil {
		if current.ProfilePicture != "" {
			os.Remove(filepath.Join("public/uploads/litters", current.ProfilePicture))
		}
		filename := fmt.Sprintf("%d-%s", time.Now().Unix(), file.Filename)
		c.SaveUploadedFile(file, filepath.Join("public/uploads/litters", filename))
		newProfilePic = filename
	}

	newImages := current.Images
	for i := 0; i < 8; i++ {
		gFile, err := c.FormFile(fmt.Sprintf("gallery_image_%d", i))
		if err == nil {
			filename := fmt.Sprintf("%d-litter-%d-%s", time.Now().Unix(), i, gFile.Filename)
			c.SaveUploadedFile(gFile, filepath.Join("public/uploads/litters", filename))
			newImages = append(newImages, filename)
		}
	}

	query := `
		UPDATE litters 
		SET name=$1, mother_id=$2, father_id=$3, external_mother_name=$4, external_father_name=$5,
			birth_date=$6, available_date=$7, status=$8, profile_picture=$9, images=$10, updated_at=NOW()
		WHERE id=$11`

	_, err = database.Pool.Exec(c, query, 
		name, motherID, fatherID, extMother, extFather,
		birthDate, availDate, status, newProfilePic, newImages, id,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Litter updated"})
}

func DeleteLitter(c *gin.Context) {
	id := c.Param("id")
	
	var current models.Litter
	err := database.Pool.QueryRow(c, "SELECT profile_picture, images FROM litters WHERE id=$1", id).Scan(&current.ProfilePicture, &current.Images)
	
	if err == nil {
		os.Remove(filepath.Join("public/uploads/litters", current.ProfilePicture))
		for _, img := range current.Images {
			os.Remove(filepath.Join("public/uploads/litters", img))
		}
	}

	_, err = database.Pool.Exec(c, "DELETE FROM litters WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete litter"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Litter deleted"})
}
