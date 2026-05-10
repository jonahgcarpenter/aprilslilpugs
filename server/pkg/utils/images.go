package utils

import (
	"bytes"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/disintegration/imaging"
	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
)

func UploadAndCreateImage(c *gin.Context, formKey string, folder string) (*models.Image, error) {
	fileHeader, err := c.FormFile(formKey)
	if err != nil {
		if errors.Is(err, http.ErrMissingFile) {
			return nil, nil
		}

		return nil, fmt.Errorf("failed to read uploaded image %q: %w", formKey, err)
	}

	srcFile, err := fileHeader.Open()
	if err != nil {
		return nil, err
	}
	defer srcFile.Close()

	img, err := imaging.Decode(srcFile)
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}

	if img.Bounds().Dx() > 1920 {
		img = imaging.Resize(img, 1920, 0, imaging.Lanczos)
	}

	var buf bytes.Buffer
	if err := imaging.Encode(&buf, img, imaging.JPEG, imaging.JPEGQuality(80)); err != nil {
		return nil, fmt.Errorf("failed to encode image: %w", err)
	}

	stem := sanitizeFileStem(strings.TrimSuffix(fileHeader.Filename, filepath.Ext(fileHeader.Filename)))
	suffix, err := randomSuffix()
	if err != nil {
		return nil, fmt.Errorf("failed to generate image name: %w", err)
	}

	fileName := fmt.Sprintf("%d-%s-%s.jpg", time.Now().UnixMilli(), stem, suffix)
	absPath, relPath, err := buildStoragePath(folder, fileName)
	if err != nil {
		return nil, err
	}

	if err := os.WriteFile(absPath, buf.Bytes(), 0o644); err != nil {
		return nil, fmt.Errorf("failed to write image: %w", err)
	}

	return &models.Image{
		URL:     buildPublicUploadURL(relPath),
		AltText: fileHeader.Filename,
	}, nil
}

func DeleteImage(imageURL string) error {
	return deleteStoredFile(imageURL)
}
