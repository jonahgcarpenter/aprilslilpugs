package models

import "time"

type Litter struct {
	ID             int       `json:"id"`
	Name           string    `json:"name" form:"name" binding:"required"`
	MotherID       *int      `json:"mother_id"` 
	FatherID       *int      `json:"father_id"`
	ExternalMother string    `json:"external_mother_name" form:"external_mother_name"`
	ExternalFather string    `json:"external_father_name" form:"external_father_name"`
	MotherName     string    `json:"mother_name"` 
	FatherName     string    `json:"father_name"` 
	BirthDate      time.Time `json:"birth_date"`
	AvailableDate  time.Time `json:"available_date"`
	ProfilePicture *Image    `json:"profile_picture"` 
	Images         []Image   `json:"images"`
	ProfilePictureID *int    `json:"-"`
	ImageIDs         []int   `json:"-"`        
	Status         string    `json:"status" form:"status"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}
