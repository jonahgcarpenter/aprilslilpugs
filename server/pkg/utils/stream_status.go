package utils

import (
	"context"
	"log/slog"
	"net/http"
	"sync"
	"time"

	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
)

type StreamMonitor struct {
	IsLive      bool
	IsEnabled   bool
	LastChecked time.Time
	mu          sync.RWMutex
}

var Monitor = &StreamMonitor{}

func StartStreamMonitoring(streamURL string) {
	initialState := getStreamEnabledFromDB()
	Monitor.mu.Lock()
	Monitor.IsEnabled = initialState
	Monitor.mu.Unlock()

	slog.Info("stream monitoring started", "enabled", initialState, "url", streamURL)

	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	if initialState {
		checkStream(streamURL)
	}

	for range ticker.C {
		Monitor.mu.RLock()
		shouldPoll := Monitor.IsEnabled
		Monitor.mu.RUnlock()

		if shouldPoll {
			checkStream(streamURL)
		}
	}
}

func SetStreamEnabled(enabled bool) {
	Monitor.mu.Lock()
	defer Monitor.mu.Unlock()
	Monitor.IsEnabled = enabled
	slog.Info("stream monitoring toggled", "enabled", enabled)
}

func getStreamEnabledFromDB() bool {
	if database.Pool == nil {
		return false
	}
	var enabled bool
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := database.Pool.QueryRow(ctx, "SELECT stream_enabled FROM settings WHERE id = 1").Scan(&enabled)
	if err != nil {
		slog.Warn("stream monitor: failed to fetch initial stream status from DB", "error", err)
		return false
	}
	return enabled
}

func GetStreamStatus() (bool, time.Time) {
	Monitor.mu.RLock()
	defer Monitor.mu.RUnlock()
	return Monitor.IsLive, Monitor.LastChecked
}

func checkStream(url string) {
	client := &http.Client{
		Timeout: 5 * time.Second,
	}
	resp, err := client.Head(url)

	currentlyLive := false
	if err != nil {
		slog.Debug("stream: health check failed", "url", url, "error", err)
	} else if resp.StatusCode != http.StatusOK {
		slog.Debug("stream: health check returned non-200", "url", url, "status_code", resp.StatusCode)
	}

	if err == nil && resp.StatusCode == 200 {
		currentlyLive = true
	}

	if resp != nil {
		resp.Body.Close()
	}

	Monitor.mu.Lock()
	previousState := Monitor.IsLive

	if Monitor.LastChecked.IsZero() {
		previousState = true
	}

	Monitor.IsLive = currentlyLive
	Monitor.LastChecked = time.Now()
	Monitor.mu.Unlock()

	if previousState != currentlyLive {
		go func(isLive bool) {
			payload := map[string]interface{}{
				"camera_name": "Puppy Cam",
			}

			if !isLive {
				slog.Warn("stream: went OFFLINE")
				payload["status"] = "offline"
			} else {
				slog.Info("stream: back ONLINE")
				payload["status"] = "online"
			}

			if err := SendAppEvent("stream_status", payload); err != nil {
				slog.Error("stream: failed to fire HA event", "error", err)
			}
		}(currentlyLive)
	}
}
