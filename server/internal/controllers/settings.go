package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
)

func GetSettings(c *gin.Context) {
	var s models.Settings
	query := `SELECT id, waitlist_enabled, stream_enabled FROM settings WHERE id = 1`

	err := database.Pool.QueryRow(c, query).Scan(
		&s.ID, &s.WaitlistEnabled, &s.StreamEnabled,
	)

	if err != nil {
		if err.Error() == "no rows in result set" {
			_, err = database.Pool.Exec(c, "INSERT INTO settings (id, waitlist_enabled, stream_enabled) VALUES (1, true, false)")
			if err == nil {
				c.JSON(http.StatusOK, models.Settings{ID: 1, WaitlistEnabled: true, StreamEnabled: false})
				return
			}
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch settings"})
		return
	}

	c.JSON(http.StatusOK, s)
}

func UpdateWaitlistStatus(c *gin.Context) {
	var input struct {
		WaitlistEnabled *bool `json:"waitlist_enabled"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.WaitlistEnabled == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Waitlist status is required"})
		return
	}

	query := `UPDATE settings SET waitlist_enabled=$1, updated_at=NOW() WHERE id=1`
	_, err := database.Pool.Exec(c, query, *input.WaitlistEnabled)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update waitlist setting"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Waitlist setting updated", "waitlist_enabled": *input.WaitlistEnabled})
}

func UpdateStreamStatus(c *gin.Context) {
	var input struct {
		StreamEnabled *bool `json:"stream_enabled"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.StreamEnabled == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Stream status is required"})
		return
	}

	query := `UPDATE settings SET stream_enabled=$1, updated_at=NOW() WHERE id=1`
	_, err := database.Pool.Exec(c, query, *input.StreamEnabled)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stream setting"})
		return
	}

	utils.SetStreamEnabled(*input.StreamEnabled)

	c.JSON(http.StatusOK, gin.H{"message": "Stream setting updated", "stream_enabled": *input.StreamEnabled})
}
