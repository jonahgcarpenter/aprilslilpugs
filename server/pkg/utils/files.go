package utils

import (
	"context"
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/config"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/minio/minio-go/v7"
)

func UploadAndCreateFile(c *gin.Context, formKey string, folder string) (*models.File, error) {
	cfg := config.Load()
	fileHeader, err := c.FormFile(formKey)
	if err != nil {
		return nil, nil
	}

	srcFile, err := fileHeader.Open()
	if err != nil {
		return nil, err
	}
	defer srcFile.Close()

	ext := filepath.Ext(fileHeader.Filename)
	rawName := strings.TrimSuffix(fileHeader.Filename, ext)
	cleanName := strings.ReplaceAll(rawName, " ", "_")
	
	objectName := fmt.Sprintf("%s/%d-%s%s", folder, time.Now().Unix(), cleanName, ext)

	contentType := fileHeader.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	_, err = minioClient.PutObject(context.Background(), cfg.MinioBucketName, objectName, srcFile, fileHeader.Size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to upload to minio: %v", err)
	}

	relativeURL := fmt.Sprintf("/%s/%s", cfg.MinioBucketName, objectName)
	now := time.Now()

	return &models.File{
		Name:      fileHeader.Filename,
		URL:       relativeURL,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

var DeleteFile = DeleteImage
