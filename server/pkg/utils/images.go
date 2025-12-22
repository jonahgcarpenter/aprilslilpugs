package utils

import (
	"fmt"
	"path/filepath"
	"time"
	"strings"
	"os"

	"github.com/disintegration/imaging"
	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
)

func UploadAndCreateImage(c *gin.Context, formKey string, folder string) (*models.Image, error) {
	fileHeader, err := c.FormFile(formKey)
	if err != nil {
		return nil, nil
	}

	srcFile, err := fileHeader.Open()
	if err != nil {
		return nil, err
	}
	defer srcFile.Close()

	img, err := imaging.Decode(srcFile)
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %v", err)
	}

	if img.Bounds().Dx() > 1920 {
		img = imaging.Resize(img, 1920, 0, imaging.Lanczos)
	}

	ext := ".jpg"
	rawName := strings.TrimSuffix(fileHeader.Filename, filepath.Ext(fileHeader.Filename))
	filename := fmt.Sprintf("%d-%s%s", time.Now().Unix(), rawName, ext)

	relativePath := fmt.Sprintf("/uploads/%s/%s", folder, filename)
	diskPath := filepath.Join("public", relativePath)

	err = imaging.Save(img, diskPath, imaging.JPEGQuality(80))
	if err != nil {
		return nil, fmt.Errorf("failed to save compressed image: %v", err)
	}

	return &models.Image{
		URL:     relativePath,
		AltText: fileHeader.Filename,
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
