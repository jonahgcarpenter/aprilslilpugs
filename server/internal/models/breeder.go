package models

import "time"

type Breeder struct {
	ID             int       `json:"id"`
	FirstName      string    `json:"firstName" binding:"required"`
	LastName       string    `json:"lastName" binding:"required"`
	Email          string    `json:"email" binding:"required,email"`
	PhoneNumber    string    `json:"phoneNumber" binding:"required"`
	Location       string    `json:"location" binding:"required"`
	Story          string    `json:"story"`
	ProfilePicture *Image    `json:"profile_picture"` 
	Images         []Image   `json:"images"`
	ProfilePictureID *int    `json:"-"`
	ImageIDs         []int   `json:"-"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}
