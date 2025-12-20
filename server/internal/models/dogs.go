package models

import "time"

type Dog struct {
	ID             int       `json:"id"`
	Name           string    `json:"name" form:"name" binding:"required"`
	Gender         string    `json:"gender" form:"gender" binding:"required,oneof=Male Female"`
	Description    string    `json:"description" form:"description"`
	BirthDate      time.Time `json:"birthDate"`
	ProfilePicture string    `json:"profilePicture"`
	Images         []string  `json:"images"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}
