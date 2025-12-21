package models

import "time"

type Puppy struct {
	ID             int       `json:"id" db:"id"`
	LitterID       int       `json:"litter_id" form:"litter_id" binding:"required" db:"litter_id"`
	Name           string    `json:"name" form:"name" binding:"required" db:"name"`
	Color          string    `json:"color" form:"color" binding:"required" db:"color"`
	Gender         string    `json:"gender" form:"gender" binding:"required,oneof=Male Female" db:"gender"`
	Status         string    `json:"status" form:"status" binding:"required,oneof=Available Reserved Sold" db:"status"`
	Description    string    `json:"description" form:"description" db:"description"`
	ProfilePictureID *int    `json:"-" db:"profile_picture_id"`
	ProfilePicture   *Image  `json:"profile_picture,omitempty" db:"-"`
	Images         []Image   `json:"images,omitempty" db:"-"`
	CreatedAt      time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt      time.Time `json:"updatedAt" db:"updated_at"`
}
