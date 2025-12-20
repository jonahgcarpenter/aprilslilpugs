package models

import "time"

type Puppy struct {
	ID             int       `json:"id"`
	LitterID       int       `json:"litter_id" form:"litter_id" binding:"required"`
	Name           string    `json:"name" form:"name" binding:"required"`
	Color          string    `json:"color" form:"color" binding:"required"`
	Gender         string    `json:"gender" form:"gender" binding:"required,oneof=Male Female"`
	Status         string    `json:"status" form:"status" binding:"required,oneof=Available Reserved Sold"`
	Description    string    `json:"description" form:"description"`
	ProfilePicture string    `json:"profile_picture"`
	Images         []string  `json:"image_ids"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}
