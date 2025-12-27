package models

import "time"

type User struct {
	ID             int       `json:"id"`
	FirstName      string    `json:"firstName" binding:"required"`
	LastName       string    `json:"lastName" binding:"required"`
	Email          string    `json:"email" binding:"required,email"`
	Password       string    `json:"password,omitempty"`
	PasswordHash   string    `json:"-"`
	PhoneNumber    string    `json:"phoneNumber" binding:"required"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token     string `json:"token"`
	Email     string `json:"email"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

type Session struct {
	ID        int       `json:"id"`
	UserID    int       `json:"userId"`
	ExpiresAt time.Time `json:"expiresAt"`
	CreatedAt time.Time `json:"createdAt"`
}
