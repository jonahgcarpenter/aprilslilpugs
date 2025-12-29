package models

import "time"

type Waitlist struct {
	ID          int       `json:"id"`
	FirstName   string    `json:"firstname" form:"firstname" binding:"required"`
	LastName    string    `json:"lastname" form:"lastname" binding:"required"`
	Email       string    `json:"email" form:"email" binding:"required,email"`
	Phone       string    `json:"phone" form:"phone"`
	Preferences string    `json:"preferences" form:"preferences"`
	Status      string    `json:"status" form:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}
