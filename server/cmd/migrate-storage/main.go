package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/config"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type migrationStats struct {
	Copied          int
	Rewritten       int
	Skipped         int
	Missing         int
	ProfileUpdates  int
	GalleryUpdates  int
	FileURLUpdates  int
	DownloadFailure int
}

type legacyStorage struct {
	client  *minio.Client
	bucket  string
	stats   migrationStats
	cache   map[string]string
	missing map[string]bool
}

type imageRecord struct {
	URL         string    `json:"url"`
	AltText     string    `json:"alt_text"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

func main() {
	cfg := config.Load()

	var dryRun bool
	var endpoint string
	var accessKey string
	var secretKey string
	var bucket string
	var useSSL bool

	flag.BoolVar(&dryRun, "dry-run", false, "Report planned changes without writing files or updating the database")
	flag.StringVar(&endpoint, "endpoint", envOr("LEGACY_S3_ENDPOINT", os.Getenv("MINIO_ENDPOINT")), "Legacy MinIO/S3 endpoint")
	flag.StringVar(&accessKey, "access-key", envOr("LEGACY_S3_ACCESS_KEY", os.Getenv("MINIO_ACCESS_KEY")), "Legacy MinIO/S3 access key")
	flag.StringVar(&secretKey, "secret-key", envOr("LEGACY_S3_SECRET_KEY", os.Getenv("MINIO_SECRET_KEY")), "Legacy MinIO/S3 secret key")
	flag.StringVar(&bucket, "bucket", envOr("LEGACY_S3_BUCKET", os.Getenv("MINIO_BUCKET_NAME")), "Legacy MinIO/S3 bucket")
	flag.BoolVar(&useSSL, "use-ssl", envBool("LEGACY_S3_USE_SSL", false), "Use SSL for the legacy MinIO/S3 endpoint")
	flag.Parse()

	if bucket == "" {
		log.Fatal("legacy storage bucket is required")
	}

	if !dryRun && (endpoint == "" || accessKey == "" || secretKey == "") {
		log.Fatal("legacy storage endpoint, access key, and secret key are required unless --dry-run is used")
	}

	database.Connect(cfg.DatabaseURL)
	defer database.Close()

	if !dryRun {
		if err := utils.EnsureStorageDirectories(); err != nil {
			log.Fatalf("failed to prepare storage directories: %v", err)
		}
	}

	migrator := &legacyStorage{
		bucket:  bucket,
		cache:   make(map[string]string),
		missing: make(map[string]bool),
	}

	if !dryRun {
		client, err := minio.New(endpoint, &minio.Options{
			Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
			Secure: useSSL,
		})
		if err != nil {
			log.Fatalf("failed to create legacy storage client: %v", err)
		}
		migrator.client = client
	}

	ctx := context.Background()
	if err := migrateEntityImages(ctx, migrator, dryRun, "breeders"); err != nil {
		log.Fatal(err)
	}
	if err := migrateEntityImages(ctx, migrator, dryRun, "dogs"); err != nil {
		log.Fatal(err)
	}
	if err := migrateEntityImages(ctx, migrator, dryRun, "litters"); err != nil {
		log.Fatal(err)
	}
	if err := migrateEntityImages(ctx, migrator, dryRun, "puppies"); err != nil {
		log.Fatal(err)
	}
	if err := migrateFiles(ctx, migrator, dryRun); err != nil {
		log.Fatal(err)
	}

	log.Printf("dry_run=%t copied=%d rewritten=%d skipped=%d missing=%d download_failures=%d profile_updates=%d gallery_updates=%d file_url_updates=%d",
		dryRun,
		migrator.stats.Copied,
		migrator.stats.Rewritten,
		migrator.stats.Skipped,
		migrator.stats.Missing,
		migrator.stats.DownloadFailure,
		migrator.stats.ProfileUpdates,
		migrator.stats.GalleryUpdates,
		migrator.stats.FileURLUpdates,
	)
}

func migrateEntityImages(ctx context.Context, migrator *legacyStorage, dryRun bool, table string) error {
	query := fmt.Sprintf("SELECT id, profile_picture, gallery FROM %s ORDER BY id ASC", table)
	rows, err := database.Pool.Query(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to query %s: %w", table, err)
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		var profileRaw []byte
		var galleryRaw []byte
		if err := rows.Scan(&id, &profileRaw, &galleryRaw); err != nil {
			return err
		}

		profile, profileChanged, err := migrateProfileImage(ctx, migrator, dryRun, profileRaw)
		if err != nil {
			return fmt.Errorf("failed to migrate %s profile image for id %d: %w", table, id, err)
		}

		gallery, galleryChanged, err := migrateGalleryImages(ctx, migrator, dryRun, galleryRaw)
		if err != nil {
			return fmt.Errorf("failed to migrate %s gallery for id %d: %w", table, id, err)
		}

		if !profileChanged && !galleryChanged {
			continue
		}

		if dryRun {
			continue
		}

		profileJSON, err := json.Marshal(profile)
		if err != nil {
			return err
		}
		galleryJSON, err := json.Marshal(gallery)
		if err != nil {
			return err
		}

		updateQuery := fmt.Sprintf("UPDATE %s SET profile_picture=$1, gallery=$2, updated_at=NOW() WHERE id=$3", table)
		if _, err := database.Pool.Exec(ctx, updateQuery, profileJSON, galleryJSON, id); err != nil {
			return fmt.Errorf("failed to update %s id %d: %w", table, id, err)
		}
	}

	return rows.Err()
}

func migrateProfileImage(ctx context.Context, migrator *legacyStorage, dryRun bool, raw []byte) (*imageRecord, bool, error) {
	trimmed := strings.TrimSpace(string(raw))
	if trimmed == "" || trimmed == "null" || trimmed == "{}" {
		return nil, false, nil
	}

	var image imageRecord
	if err := json.Unmarshal(raw, &image); err != nil {
		return nil, false, err
	}

	newURL, changed, err := migrator.migrateURL(ctx, image.URL, dryRun)
	if err != nil {
		return nil, false, err
	}
	if !changed {
		return &image, false, nil
	}

	image.URL = newURL
	migrator.stats.ProfileUpdates++
	return &image, true, nil
}

func migrateGalleryImages(ctx context.Context, migrator *legacyStorage, dryRun bool, raw []byte) ([]imageRecord, bool, error) {
	trimmed := strings.TrimSpace(string(raw))
	if trimmed == "" || trimmed == "null" || trimmed == "[]" {
		return []imageRecord{}, false, nil
	}

	var gallery []imageRecord
	if err := json.Unmarshal(raw, &gallery); err != nil {
		return nil, false, err
	}

	changed := false
	for i := range gallery {
		newURL, rewritten, err := migrator.migrateURL(ctx, gallery[i].URL, dryRun)
		if err != nil {
			return nil, false, err
		}
		if rewritten {
			gallery[i].URL = newURL
			changed = true
			migrator.stats.GalleryUpdates++
		}
	}

	return gallery, changed, nil
}

func migrateFiles(ctx context.Context, migrator *legacyStorage, dryRun bool) error {
	rows, err := database.Pool.Query(ctx, "SELECT id, url FROM files ORDER BY id ASC")
	if err != nil {
		return fmt.Errorf("failed to query files table: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		var fileURL string
		if err := rows.Scan(&id, &fileURL); err != nil {
			return err
		}

		newURL, changed, err := migrator.migrateURL(ctx, fileURL, dryRun)
		if err != nil {
			return fmt.Errorf("failed to migrate file id %d: %w", id, err)
		}
		if !changed || dryRun {
			continue
		}

		if _, err := database.Pool.Exec(ctx, "UPDATE files SET url=$1, updated_at=NOW() WHERE id=$2", newURL, id); err != nil {
			return fmt.Errorf("failed to update file id %d: %w", id, err)
		}
		migrator.stats.FileURLUpdates++
	}

	return rows.Err()
}

func (m *legacyStorage) migrateURL(ctx context.Context, fileURL string, dryRun bool) (string, bool, error) {
	if fileURL == "" {
		return "", false, nil
	}
	if strings.HasPrefix(fileURL, config.Load().UploadsURLBase+"/") {
		m.stats.Skipped++
		return fileURL, false, nil
	}
	if rewritten, ok := m.cache[fileURL]; ok {
		m.stats.Rewritten++
		return rewritten, true, nil
	}

	objectKey, newURL, absPath, err := legacyURLToLocal(fileURL, m.bucket)
	if err != nil {
		return "", false, err
	}

	if dryRun {
		m.cache[fileURL] = newURL
		m.stats.Rewritten++
		return newURL, true, nil
	}

	if err := os.MkdirAll(filepath.Dir(absPath), 0o755); err != nil {
		return "", false, err
	}

	obj, err := m.client.GetObject(ctx, m.bucket, objectKey, minio.GetObjectOptions{})
	if err != nil {
		m.stats.DownloadFailure++
		return "", false, err
	}
	defer obj.Close()

	if _, err := obj.Stat(); err != nil {
		var minioErr minio.ErrorResponse
		if (errors.As(err, &minioErr) && minioErr.Code == "NoSuchKey") || strings.Contains(err.Error(), "The specified key does not exist") {
			if !m.missing[fileURL] {
				m.stats.Missing++
				m.missing[fileURL] = true
			}
			return fileURL, false, nil
		}
		m.stats.DownloadFailure++
		return "", false, err
	}

	dst, err := os.Create(absPath)
	if err != nil {
		return "", false, err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, obj); err != nil {
		m.stats.DownloadFailure++
		return "", false, err
	}

	m.cache[fileURL] = newURL
	m.stats.Copied++
	m.stats.Rewritten++
	return newURL, true, nil
}

func legacyURLToLocal(fileURL, expectedBucket string) (string, string, string, error) {
	u, err := url.Parse(fileURL)
	if err != nil {
		return "", "", "", fmt.Errorf("invalid legacy url %q: %w", fileURL, err)
	}

	parts := strings.Split(strings.TrimPrefix(pathFromURL(u), "/"), "/")
	if len(parts) < 3 {
		return "", "", "", fmt.Errorf("legacy url %q does not include bucket/folder/file", fileURL)
	}
	if parts[0] != expectedBucket {
		return "", "", "", fmt.Errorf("legacy url %q does not match bucket %q", fileURL, expectedBucket)
	}

	relPath := filepath.Join(parts[1:]...)
	absPath := filepath.Join(config.Load().StorageRoot, relPath)
	publicURL := strings.TrimSuffix(config.Load().UploadsURLBase, "/") + "/" + filepath.ToSlash(relPath)
	return filepath.ToSlash(relPath), publicURL, absPath, nil
}

func pathFromURL(u *url.URL) string {
	if u.Path != "" {
		return u.Path
	}
	return u.Opaque
}

func envOr(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func envBool(key string, fallback bool) bool {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return strings.EqualFold(value, "true") || value == "1" || strings.EqualFold(value, "yes")
}
