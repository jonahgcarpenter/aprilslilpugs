package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/config"
)

func GenerateToken(userID int) (string, error) {
	cfg := config.Load()

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})

	return token.SignedString([]byte(cfg.JWTSecret))
}
