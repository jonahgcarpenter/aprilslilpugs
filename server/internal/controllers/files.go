package controllers

import (
	"net/http"
	
	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
)

func GetFiles(c *gin.Context) {
	rows, err := database.Pool.Query(c, "SELECT id, name, url, created_at, updated_at FROM files ORDER BY created_at DESC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch files"})
		return
	}
	defer rows.Close()

	var files []models.File
	for rows.Next() {
		var f models.File
		if err := rows.Scan(&f.ID, &f.Name, &f.URL, &f.CreatedAt, &f.UpdatedAt); err == nil {
			files = append(files, f)
		}
	}
	c.JSON(http.StatusOK, files)
}

func CreateFile(c *gin.Context) {
	file, err := utils.UploadAndCreateFile(c, "file", "files")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if file == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	var id int
	err = database.Pool.QueryRow(c, "INSERT INTO files (name, url) VALUES ($1, $2) RETURNING id", file.Name, file.URL).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	file.ID = id
	c.JSON(http.StatusCreated, file)
}

func DeleteFile(c *gin.Context) {
	id := c.Param("id")
	var url string
	
	err := database.Pool.QueryRow(c, "SELECT url FROM files WHERE id=$1", id).Scan(&url)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	_ = utils.DeleteFile(url)

	_, err = database.Pool.Exec(c, "DELETE FROM files WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File deleted"})
}
