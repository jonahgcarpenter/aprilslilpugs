package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"strings"
	"unicode"

	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/config"
)

var uploadFolders = []string{"breeders", "dogs", "litters", "puppies", "files"}

func EnsureStorageDirectories() error {
	root := config.Load().StorageRoot
	for _, folder := range uploadFolders {
		if err := os.MkdirAll(filepath.Join(root, folder), 0o755); err != nil {
			return err
		}
	}
	return nil
}

func buildStoragePath(folder, fileName string) (string, string, error) {
	cleanFolder := sanitizePathSegment(folder)
	if cleanFolder == "" {
		return "", "", fmt.Errorf("invalid storage folder")
	}

	cleanFileName := sanitizePathSegment(fileName)
	if cleanFileName == "" {
		return "", "", fmt.Errorf("invalid file name")
	}

	root := config.Load().StorageRoot
	absRoot, err := filepath.Abs(root)
	if err != nil {
		return "", "", err
	}

	relPath := filepath.Join(cleanFolder, cleanFileName)
	absPath := filepath.Join(absRoot, relPath)

	if !strings.HasPrefix(absPath, absRoot+string(os.PathSeparator)) && absPath != absRoot {
		return "", "", fmt.Errorf("invalid storage path")
	}

	return absPath, relPath, nil
}

func buildPublicUploadURL(relPath string) string {
	base := strings.TrimSuffix(config.Load().UploadsURLBase, "/")
	cleanRel := strings.TrimLeft(filepath.ToSlash(relPath), "/")
	return base + "/" + cleanRel
}

func storagePathFromURL(fileURL string) (string, error) {
	if fileURL == "" {
		return "", nil
	}

	base := strings.TrimSuffix(config.Load().UploadsURLBase, "/")
	u, err := url.Parse(fileURL)
	if err != nil {
		return "", fmt.Errorf("invalid url: %w", err)
	}

	cleanPath := path.Clean(u.Path)
	if !strings.HasPrefix(cleanPath, base+"/") {
		return "", nil
	}

	relURLPath := strings.TrimPrefix(cleanPath, base+"/")
	relFSPath := filepath.FromSlash(relURLPath)

	root := config.Load().StorageRoot
	absRoot, err := filepath.Abs(root)
	if err != nil {
		return "", err
	}

	absPath := filepath.Join(absRoot, relFSPath)
	if !strings.HasPrefix(absPath, absRoot+string(os.PathSeparator)) {
		return "", fmt.Errorf("invalid storage path")
	}

	return absPath, nil
}

func deleteStoredFile(fileURL string) error {
	absPath, err := storagePathFromURL(fileURL)
	if err != nil || absPath == "" {
		return err
	}

	if err := os.Remove(absPath); err != nil && !os.IsNotExist(err) {
		return err
	}

	return nil
}

func sanitizeFileStem(name string) string {
	trimmed := strings.TrimSpace(name)
	if trimmed == "" {
		return "file"
	}

	var builder strings.Builder
	lastDash := false
	for _, r := range trimmed {
		switch {
		case unicode.IsLetter(r), unicode.IsDigit(r):
			builder.WriteRune(unicode.ToLower(r))
			lastDash = false
		case r == '-' || r == '_':
			builder.WriteRune(r)
			lastDash = false
		case r == ' ' || r == '.':
			if !lastDash {
				builder.WriteRune('-')
				lastDash = true
			}
		}
	}

	cleaned := strings.Trim(builder.String(), "-_")
	if cleaned == "" {
		return "file"
	}

	return cleaned
}

func sanitizePathSegment(name string) string {
	trimmed := strings.TrimSpace(filepath.Base(name))
	trimmed = strings.ReplaceAll(trimmed, "..", "")
	trimmed = strings.ReplaceAll(trimmed, "/", "")
	trimmed = strings.ReplaceAll(trimmed, "\\", "")
	return trimmed
}

func randomSuffix() (string, error) {
	buf := make([]byte, 6)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}
