package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/config"
)

type HAPushData struct {
	Sound string `json:"sound,omitempty"`
	Badge int    `json:"badge,omitempty"`
}

type HANotificationData struct {
	Push HAPushData `json:"push"`
}

type HAPayload struct {
	Message string              `json:"message"`
	Title   string              `json:"title"`
	Data    *HANotificationData `json:"data,omitempty"`
}

func SendNotification(message string, sound string) error {
	cfg := config.Load()

	if cfg.HASNotifyURL == "" || cfg.HASToken == "" {
		fmt.Println("Warning: HAS_NOTIFY_URL or HAS_TOKEN is missing")
		return nil
	}

	payload := HAPayload{
		Message: message,
		Title:   "JARVIS",
		Data: &HANotificationData{
			Push: HAPushData{
				Sound: sound,
				Badge: 1,
			},
		},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal notification payload: %v", err)
	}

	req, err := http.NewRequest("POST", cfg.HASNotifyURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+cfg.HASToken)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send notification: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("notification failed with status code: %d", resp.StatusCode)
	}

	fmt.Printf("Notification sent: \"%s\" (Sound: %s)\n", message, sound)
	return nil
}
