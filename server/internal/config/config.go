package config

import (
	"log/slog"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port             string
	DatabaseURL      string
	JWTSecret        string
	Env              string
	StorageRoot      string
	UploadsURLBase   string
	StreamURL        string
	HASBaseURL       string
	HASToken         string
	EmailUser        string
	EmailPassword    string
	EmailServiceHost string
	EmailServicePort string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		slog.Info("no .env file found, relying on system environment variables")
	}

	return &Config{
		Port:             getEnv("PORT", "4000"),
		DatabaseURL:      getEnv("DATABASE_URL", ""),
		JWTSecret:        getEnv("JWT_SECRET", "verylongsecret"),
		Env:              getEnv("GO_ENV", "development"),
		StorageRoot:      getEnv("STORAGE_ROOT", "./storage"),
		UploadsURLBase:   getEnv("UPLOADS_URL_BASE", "/uploads"),
		StreamURL:        getEnv("STREAM_URL", "http://localhost:8080/hls/test.m3u8"),
		HASBaseURL:       getEnv("HAS_BASE_URL", "http://homeassistant.local:8123"),
		HASToken:         getEnv("HAS_TOKEN", ""),
		EmailUser:        getEnv("EMAIL_USER", ""),
		EmailPassword:    getEnv("EMAIL_PASSWORD", ""),
		EmailServiceHost: getEnv("EMAIL_HOST", "smtp.gmail.com"),
		EmailServicePort: getEnv("EMAIL_PORT", "587"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
