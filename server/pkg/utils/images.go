package utils

import (
	"fmt"
	"path/filepath"
	"time"
	"os"

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

func DeleteImage(imageURL string) error {
	if imageURL == "" {
		return nil
	}

	diskPath := filepath.Join("public", imageURL)

	err := os.Remove(diskPath)
	if err != nil {
		if os.IsNotExist(err) {
			fmt.Printf("File not found: %s\n", diskPath)
			return nil 
		}
		return err
	}
	
	return err
}
