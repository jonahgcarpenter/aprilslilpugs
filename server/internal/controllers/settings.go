package controllers

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/stream"
)

func GetSettings(c *gin.Context) {
	var s models.Settings
	query := `SELECT id, waitlist_enabled, stream_enabled FROM settings WHERE id = 1`

	err := database.Pool.QueryRow(c, query).Scan(
		&s.ID, &s.WaitlistEnabled, &s.StreamEnabled,
	)

	if err != nil {
		if err.Error() == "no rows in result set" {
			slog.Info("get settings: no settings row found, inserting defaults")
			_, err = database.Pool.Exec(c, "INSERT INTO settings (id, waitlist_enabled, stream_enabled) VALUES (1, true, false)")
			if err == nil {
				c.JSON(http.StatusOK, models.Settings{ID: 1, WaitlistEnabled: true, StreamEnabled: false})
				return
			}
			slog.Error("get settings: failed to insert default settings", "error", err)
		} else {
			slog.Error("get settings: database error", "error", err)
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
		slog.Debug("update waitlist status: invalid request body", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.WaitlistEnabled == nil {
		slog.Debug("update waitlist status: missing waitlist_enabled field")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Waitlist status is required"})
		return
	}

	query := `UPDATE settings SET waitlist_enabled=$1, updated_at=NOW() WHERE id=1`
	_, err := database.Pool.Exec(c, query, *input.WaitlistEnabled)

	if err != nil {
		slog.Error("update waitlist status: database error", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update waitlist setting"})
		return
	}

	slog.Info("update waitlist status: updated", "waitlist_enabled", *input.WaitlistEnabled)
	c.JSON(http.StatusOK, gin.H{"message": "Waitlist setting updated", "waitlist_enabled": *input.WaitlistEnabled})
}

func UpdateStreamStatus(c *gin.Context) {
	var input struct {
		StreamEnabled *bool `json:"stream_enabled"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		slog.Debug("update stream status: invalid request body", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.StreamEnabled == nil {
		slog.Debug("update stream status: missing stream_enabled field")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Stream status is required"})
		return
	}

	if *input.StreamEnabled {
		if err := stream.Global.Enable(); err != nil {
			slog.Error("update stream status: failed to start listeners", "error", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start stream listeners"})
			return
		}
	}

	query := `UPDATE settings SET stream_enabled=$1, updated_at=NOW() WHERE id=1`
	_, err := database.Pool.Exec(c, query, *input.StreamEnabled)

	if err != nil {
		if *input.StreamEnabled {
			stream.Global.Disable()
		}
		slog.Error("update stream status: database error", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stream setting"})
		return
	}

	if !*input.StreamEnabled {
		stream.Global.Disable()
	}

	slog.Info("update stream status: updated", "stream_enabled", *input.StreamEnabled)
	c.JSON(http.StatusOK, gin.H{"message": "Stream setting updated", "stream_enabled": *input.StreamEnabled})
}

func GetStreamStatus(c *gin.Context) {
	c.JSON(http.StatusOK, stream.Global.Status())
}

func GetAdminStreamStatus(c *gin.Context) {
	c.JSON(http.StatusOK, stream.Global.AdminStatus())
}
