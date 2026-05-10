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
	LogLevel         string
	StorageRoot      string
	UploadsURLBase   string
	RTMPAddr         string
	RTMPSAddr        string
	RTMPSCertFile    string
	RTMPSKeyFile     string
	StreamHost       string
	StreamKey        string
	HLSPublicPath    string
	HASBaseURL       string
	HASToken         string
	EmailUser        string
	EmailPassword    string
	EmailServiceHost string
	EmailServicePort string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		slog.Debug("config: no .env file found, relying on system environment variables")
	}

	return &Config{
		Port:             getEnv("PORT", "4000"),
		DatabaseURL:      getEnv("DATABASE_URL", ""),
		JWTSecret:        getEnv("JWT_SECRET", "verylongsecret"),
		LogLevel:         getEnv("LOG_LEVEL", "info"),
		StorageRoot:      getEnv("STORAGE_ROOT", "./storage"),
		UploadsURLBase:   getEnv("UPLOADS_URL_BASE", "/uploads"),
		RTMPAddr:         getEnv("RTMP_ADDR", ":1935"),
		RTMPSAddr:        getEnv("RTMPS_ADDR", ":1936"),
		RTMPSCertFile:    getEnv("RTMPS_CERT_FILE", ""),
		RTMPSKeyFile:     getEnv("RTMPS_KEY_FILE", ""),
		StreamHost:       getEnv("STREAM_HOST", "localhost"),
		StreamKey:        getEnv("STREAM_KEY", "puppy-cam"),
		HLSPublicPath:    getEnv("HLS_PUBLIC_PATH", "/hls/index.m3u8"),
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
