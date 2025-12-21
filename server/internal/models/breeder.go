package models

import "time"

type Breeder struct {
	ID             int       `json:"id" db:"id"`
	FirstName      string    `json:"firstName" form:"firstName" binding:"required" db:"first_name"`
	LastName       string    `json:"lastName" form:"lastName" binding:"required" db:"last_name"`
	Email          string    `json:"email" binding:"required,email" db:"email"`
	PhoneNumber    string    `json:"phoneNumber" binding:"required" db:"phone_number"`
	Location       string    `json:"location" binding:"required" db:"location"`
	Story          string    `json:"story" db:"story"`
	ProfilePictureID *int    `json:"-" db:"profile_picture_id"` 
	ProfilePicture   *Image  `json:"profile_picture,omitempty" db:"-"`
	Images         []Image   `json:"images,omitempty" db:"-"` 
	CreatedAt      time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt      time.Time `json:"updatedAt" db:"updated_at"`
}
