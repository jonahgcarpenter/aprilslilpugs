package utils

import (
	"fmt"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
)

func UploadAndCreateImage(c *gin.Context, formKey string, folder string) (*models.Image, error) {
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

	return &models.Image{
		URL:     relativePath,
		AltText: file.Filename,
	}, nil
}
