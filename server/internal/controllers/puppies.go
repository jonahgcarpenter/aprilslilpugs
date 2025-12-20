package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
)

func formatPuppyImages(p *models.Puppy) {
	if p.ProfilePicture != "" {
		p.ProfilePicture = "/uploads/puppies/" + p.ProfilePicture
	}
	for i, img := range p.Images {
		if img != "" {
			p.Images[i] = "/uploads/puppies/" + img
		}
	}
}

func GetPuppies(c *gin.Context) {
	litterID := c.Query("litter_id")

	query := `SELECT id, litter_id, name, color, gender, status, description, profile_picture, images FROM puppies`
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
		if err := rows.Scan(&p.ID, &p.LitterID, &p.Name, &p.Color, &p.Gender, &p.Status, &p.Description, &p.ProfilePicture, &p.Images); err != nil {
			continue
		}
		formatPuppyImages(&p)
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

	err := database.Pool.QueryRow(c, "SELECT id, litter_id, name, color, gender, status, description, profile_picture, images FROM puppies WHERE id=$1", id).Scan(
		&p.ID, &p.LitterID, &p.Name, &p.Color, &p.Gender, &p.Status, &p.Description, &p.ProfilePicture, &p.Images,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Puppy not found"})
		return
	}
	formatPuppyImages(&p)
	c.JSON(http.StatusOK, p)
}

func CreatePuppy(c *gin.Context) {
	litterID := c.PostForm("litter_id")
	name := c.PostForm("name")
	color := c.PostForm("color")
	gender := c.PostForm("gender")
	status := c.PostForm("status")
	desc := c.PostForm("description")

	var profilePic string
	file, err := c.FormFile("profile_picture")
	if err == nil {
		filename := fmt.Sprintf("%d-%s", time.Now().Unix(), file.Filename)
		c.SaveUploadedFile(file, filepath.Join("public/uploads/puppies", filename))
		profilePic = filename
	}

	var images []string
	for i := 0; i < 6; i++ {
		gFile, err := c.FormFile(fmt.Sprintf("gallery_image_%d", i))
		if err == nil {
			filename := fmt.Sprintf("%d-puppy-%d-%s", time.Now().Unix(), i, gFile.Filename)
			c.SaveUploadedFile(gFile, filepath.Join("public/uploads/puppies", filename))
			images = append(images, filename)
		}
	}
	if images == nil { images = []string{} }

	var newID int
	query := `
		INSERT INTO puppies (litter_id, name, color, gender, status, description, profile_picture, images)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id`
	
	err = database.Pool.QueryRow(c, query, 
		litterID, name, color, gender, status, desc, profilePic, images,
	).Scan(&newID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Puppy created", "id": newID})
}

func UpdatePuppy(c *gin.Context) {
	id := c.Param("id")

	var current models.Puppy
	err := database.Pool.QueryRow(c, "SELECT profile_picture, images FROM puppies WHERE id=$1", id).Scan(&current.ProfilePicture, &current.Images)
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

	newProfilePic := current.ProfilePicture
	file, err := c.FormFile("profile_picture")
	if err == nil {
		if current.ProfilePicture != "" {
			os.Remove(filepath.Join("public/uploads/puppies", current.ProfilePicture))
		}
		filename := fmt.Sprintf("%d-%s", time.Now().Unix(), file.Filename)
		c.SaveUploadedFile(file, filepath.Join("public/uploads/puppies", filename))
		newProfilePic = filename
	}

	newImages := current.Images
	for i := 0; i < 6; i++ {
		gFile, err := c.FormFile(fmt.Sprintf("gallery_image_%d", i))
		if err == nil {
			filename := fmt.Sprintf("%d-puppy-%d-%s", time.Now().Unix(), i, gFile.Filename)
			c.SaveUploadedFile(gFile, filepath.Join("public/uploads/puppies", filename))
			newImages = append(newImages, filename)
		}
	}

	query := `
		UPDATE puppies 
		SET litter_id=$1, name=$2, color=$3, gender=$4, status=$5, description=$6, profile_picture=$7, images=$8, updated_at=NOW()
		WHERE id=$9`

	_, err = database.Pool.Exec(c, query, 
		litterID, name, color, gender, status, desc, newProfilePic, newImages, id,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Puppy updated"})
}

func DeletePuppy(c *gin.Context) {
	id := c.Param("id")
	
	var current models.Puppy
	err := database.Pool.QueryRow(c, "SELECT profile_picture, images FROM puppies WHERE id=$1", id).Scan(&current.ProfilePicture, &current.Images)
	
	if err == nil {
		os.Remove(filepath.Join("public/uploads/puppies", current.ProfilePicture))
		for _, img := range current.Images {
			os.Remove(filepath.Join("public/uploads/puppies", img))
		}
	}

	_, err = database.Pool.Exec(c, "DELETE FROM puppies WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete puppy"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Puppy deleted"})
}
