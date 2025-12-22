package models

import "time"

type Dog struct {
	ID             int       `json:"id" db:"id"`
	Name           string    `json:"name" form:"name" binding:"required" db:"name"`
	Gender         string    `json:"gender" form:"gender" binding:"required,oneof=Male Female" db:"gender"`
	Description    string    `json:"description" form:"description" db:"description"`
	BirthDate      time.Time `json:"birthDate" form:"birthDate" db:"birth_date"`
	ProfilePicture *Image 	 `json:"profilePicture,omitempty" db:"profile_picture"`
	Gallery 			 []Image 	 `json:"gallery,omitempty" db:"gallery"`
	CreatedAt      time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt      time.Time `json:"updatedAt" db:"updated_at"`
}
