package utils

import (
	"fmt"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
)

func UploadAndCreateImage(c *gin.Context, formKey string, folder string) (*int, error) {
	file, err := c.FormFile(formKey)
	if err != nil {
		return nil, nil
	}

	filename := fmt.Sprintf("%d-%s", time.Now().Unix(), file.Filename)
	relativePath := fmt.Sprintf("/uploads/%s/%s", folder, filename)
	diskPath := filepath.Join("public", relativePath)

	if err := c.SaveUploadedFile(file, diskPath); err != nil {
		return nil, err
	}

	var newImageID int
	query := `INSERT INTO images (url, alt_text) VALUES ($1, $2) RETURNING id`
	err = database.Pool.QueryRow(c, query, relativePath, filename).Scan(&newImageID)
	if err != nil {
		return nil, err
	}

	return &newImageID, nil
}
