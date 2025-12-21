package models

import "time"

type Litter struct {
	ID             int       `json:"id" db:"id"`
	Name           string    `json:"name" form:"name" binding:"required" db:"name"`
	MotherID       *int      `json:"mother_id" db:"mother_id"`
	FatherID       *int      `json:"father_id" db:"father_id"`
	ExternalMother string    `json:"external_mother_name" form:"external_mother_name" db:"external_mother_name"`
	ExternalFather string    `json:"external_father_name" form:"external_father_name" db:"external_father_name"`
	MotherName     string    `json:"mother_name" db:"-"` 
	FatherName     string    `json:"father_name" db:"-"` 
	BirthDate      time.Time `json:"birth_date" form:"birth_date" db:"birth_date"`
	AvailableDate  time.Time `json:"available_date" form:"available_date" db:"available_date"`
	Status         string    `json:"status" form:"status" db:"status"`
	ProfilePictureID *int    `json:"-" db:"profile_picture_id"`
	ProfilePicture   *Image  `json:"profile_picture,omitempty" db:"-"`
	Images         []Image   `json:"images,omitempty" db:"-"`
	CreatedAt      time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt      time.Time `json:"updatedAt" db:"updated_at"`
}
