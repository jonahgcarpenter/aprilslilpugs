package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
)

func GetSettings(c *gin.Context) {
	var s models.Settings
	query := `SELECT id, waitlist_enabled, stream_enabled FROM settings WHERE id = 1`

	err := database.Pool.QueryRow(c, query).Scan(
		&s.ID, &s.WaitlistEnabled, &s.StreamEnabled,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch settings"})
		return
	}

	c.JSON(http.StatusOK, s)
}

func UpdateWaitlistStatus(c *gin.Context) {
	var input struct {
		WaitlistEnabled bool `json:"waitlist_enabled" form:"waitlist_enabled"`
	}

	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `UPDATE settings SET waitlist_enabled=$1, updated_at=NOW() WHERE id=1`
	_, err := database.Pool.Exec(c, query, input.WaitlistEnabled)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update waitlist setting"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Waitlist setting updated", "waitlist_enabled": input.WaitlistEnabled})
}

func UpdateStreamStatus(c *gin.Context) {
	var input struct {
		StreamEnabled bool `json:"stream_enabled" form:"stream_enabled"`
	}

	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `UPDATE settings SET stream_enabled=$1, updated_at=NOW() WHERE id=1`
	_, err := database.Pool.Exec(c, query, input.StreamEnabled)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stream setting"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Stream setting updated", "stream_enabled": input.StreamEnabled})
}
