package models

import "time"

type Image struct {
	URL         string    `json:"url" db:"url"`
	AltText     string    `json:"alt_text" db:"alt_text"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}
