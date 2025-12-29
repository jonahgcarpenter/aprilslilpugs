package utils

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"net/url"
	"path/filepath"
	"strings"
	"time"

	"github.com/disintegration/imaging"
	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/config"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var minioClient *minio.Client

func InitMinio() {
	cfg := config.Load()

	var err error
	minioClient, err = minio.New(cfg.MinioEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.MinioAccessKey, cfg.MinioSecretKey, ""),
		Secure: cfg.MinioUseSSL,
	})
	if err != nil {
		log.Fatalln(err)
	}
	log.Println("Successfully connected to Minio")
}

func UploadAndCreateImage(c *gin.Context, formKey string, folder string) (*models.Image, error) {
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

	img, err := imaging.Decode(srcFile)
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %v", err)
	}

	if img.Bounds().Dx() > 1920 {
		img = imaging.Resize(img, 1920, 0, imaging.Lanczos)
	}

	var buf bytes.Buffer
	err = imaging.Encode(&buf, img, imaging.JPEG, imaging.JPEGQuality(80))
	if err != nil {
		return nil, fmt.Errorf("failed to encode image: %v", err)
	}

	ext := ".jpg"
	rawName := strings.TrimSuffix(fileHeader.Filename, filepath.Ext(fileHeader.Filename))
	cleanName := strings.ReplaceAll(rawName, " ", "_") 
	objectName := fmt.Sprintf("%s/%d-%s%s", folder, time.Now().Unix(), cleanName, ext)

	_, err = minioClient.PutObject(context.Background(), cfg.MinioBucketName, objectName, &buf, int64(buf.Len()), minio.PutObjectOptions{
		ContentType: "image/jpeg",
	})
	if err != nil {
		return nil, fmt.Errorf("failed to upload to minio: %v", err)
	}

	relativeURL := fmt.Sprintf("/%s/%s", cfg.MinioBucketName, objectName)

	return &models.Image{
		URL:     relativeURL,
		AltText: fileHeader.Filename,
	}, nil
}

func DeleteImage(imageURL string) error {
	if imageURL == "" {
		return nil
	}
	cfg := config.Load()

	u, err := url.Parse(imageURL)
	if err != nil {
		return fmt.Errorf("invalid url: %v", err)
	}

	pathParts := strings.SplitN(strings.TrimPrefix(u.Path, "/"), "/", 2)
	
	if len(pathParts) < 2 {
		return nil
	}
	
	objectName := pathParts[1]

	err = minioClient.RemoveObject(context.Background(), cfg.MinioBucketName, objectName, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("failed to delete from minio: %v", err)
	}

	return nil
}
