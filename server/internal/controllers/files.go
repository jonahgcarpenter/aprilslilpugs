package controllers

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
)

func GetFiles(c *gin.Context) {
	rows, err := database.Pool.Query(c, "SELECT id, name, url, created_at, updated_at FROM files ORDER BY created_at DESC")
	if err != nil {
		slog.Error("get files: database error", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch files"})
		return
	}
	defer rows.Close()

	var files []models.File
	for rows.Next() {
		var f models.File
		if err := rows.Scan(&f.ID, &f.Name, &f.URL, &f.CreatedAt, &f.UpdatedAt); err != nil {
			slog.Warn("get files: failed to scan row", "error", err)
		} else {
			files = append(files, f)
		}
	}
	c.JSON(http.StatusOK, files)
}

func CreateFile(c *gin.Context) {
	file, err := utils.UploadAndCreateFile(c, "file", "files")
	if err != nil {
		slog.Error("create file: failed to upload file", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload file"})
		return
	}
	if file == nil {
		slog.Debug("create file: no file provided")
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	var id int
	err = database.Pool.QueryRow(c, "INSERT INTO files (name, url) VALUES ($1, $2) RETURNING id", file.Name, file.URL).Scan(&id)
	if err != nil {
		slog.Error("create file: database error", "name", file.Name, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	file.ID = id
	slog.Info("create file: file created", "file_id", id, "name", file.Name)
	c.JSON(http.StatusCreated, file)
}

func DeleteFile(c *gin.Context) {
	id := c.Param("id")
	var url string

	err := database.Pool.QueryRow(c, "SELECT url FROM files WHERE id=$1", id).Scan(&url)
	if err != nil {
		if err == pgx.ErrNoRows {
			slog.Debug("delete file: not found", "file_id", id, "error", err)
			c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
			return
		}

		slog.Error("delete file: failed to fetch file before delete", "file_id", id, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete file"})
		return
	}

	if err := utils.DeleteFile(url); err != nil {
		slog.Warn("delete file: failed to delete file from storage", "url", url, "error", err)
	}

	_, err = database.Pool.Exec(c, "DELETE FROM files WHERE id=$1", id)
	if err != nil {
		slog.Error("delete file: database error", "file_id", id, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete file"})
		return
	}

	slog.Info("delete file: file deleted", "file_id", id)
	c.JSON(http.StatusOK, gin.H{"message": "File deleted"})
}
