package utils

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
)

func UploadAndCreateFile(c *gin.Context, formKey string, folder string) (*models.File, error) {
	fileHeader, err := c.FormFile(formKey)
	if err != nil {
		if errors.Is(err, http.ErrMissingFile) {
			return nil, nil
		}

		return nil, fmt.Errorf("failed to read uploaded file %q: %w", formKey, err)
	}

	srcFile, err := fileHeader.Open()
	if err != nil {
		return nil, err
	}
	defer srcFile.Close()

	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	stem := sanitizeFileStem(strings.TrimSuffix(fileHeader.Filename, ext))
	suffix, err := randomSuffix()
	if err != nil {
		return nil, fmt.Errorf("failed to generate file name: %w", err)
	}

	fileName := fmt.Sprintf("%d-%s-%s%s", time.Now().UnixMilli(), stem, suffix, ext)
	absPath, relPath, err := buildStoragePath(folder, fileName)
	if err != nil {
		return nil, err
	}

	dstFile, err := os.Create(absPath)
	if err != nil {
		return nil, fmt.Errorf("failed to create file: %w", err)
	}
	defer dstFile.Close()

	if _, err := io.Copy(dstFile, srcFile); err != nil {
		return nil, fmt.Errorf("failed to write file: %w", err)
	}

	now := time.Now()
	return &models.File{
		Name:      fileHeader.Filename,
		URL:       buildPublicUploadURL(relPath),
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

var DeleteFile = deleteStoredFile
