package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/config"
)

const AppGlobalEventName = "aprilslilpugs_event"

func SendAppEvent(eventType string, data map[string]interface{}) error {
	cfg := config.Load()

	if cfg.HASBaseURL == "" || cfg.HASToken == "" {
		fmt.Println("Warning: HAS_BASE_URL or HAS_TOKEN is missing")
		return nil
	}

	if data == nil {
		data = make(map[string]interface{})
	}

	data["type"] = eventType
	data["timestamp"] = time.Now().Format(time.RFC3339)
	data["source"] = "aprilslilpugs-backend"

	url := fmt.Sprintf("%s/api/events/%s", cfg.HASBaseURL, AppGlobalEventName)

	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal event data: %v", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+cfg.HASToken)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to fire event: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("HA API returned error: %d", resp.StatusCode)
	}

	fmt.Printf("Fired Global Event '%s' (Type: %s)\n", AppGlobalEventName, eventType)
	return nil
}
