package models

import "time"

type Image struct {
	ID        int       `json:"id"`
	URL       string    `json:"url"`
	AltText   string    `json:"alt_text"`
	CreatedAt time.Time `json:"created_at"`
}
