package utils

import (
	"fmt"
	"net/http"
	"sync"
	"time"
)

type StreamMonitor struct {
	IsLive      bool
	LastChecked time.Time
	mu          sync.RWMutex
}

var Monitor = &StreamMonitor{}

func StartStreamMonitoring(streamURL string) {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	checkStream(streamURL)

	for range ticker.C {
		checkStream(streamURL)
	}
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
				fmt.Println("ALERT: Stream went OFFLINE")
				payload["status"] = "offline"
			} else {
				fmt.Println("NOTICE: Stream is BACK ONLINE")
				payload["status"] = "online"
			}

			err := SendAppEvent("stream_status", payload)
			if err != nil {
				fmt.Printf("Error firing HA event: %v\n", err)
			}
		}(currentlyLive)
	}
}
