package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
)

func GetWaitlist(c *gin.Context) {
	query := `
		SELECT id, first_name, last_name, email, phone, preferences, status, created_at, updated_at
		FROM waitlist
		ORDER BY created_at ASC`

	rows, err := database.Pool.Query(c, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch waitlist"})
		return
	}
	defer rows.Close()

	var waitlist []models.Waitlist
	for rows.Next() {
		var w models.Waitlist
		if err := rows.Scan(
			&w.ID, &w.FirstName, &w.LastName, &w.Email, &w.Phone, &w.Preferences, &w.Status, &w.CreatedAt, &w.UpdatedAt,
		); err != nil {
			continue
		}
		waitlist = append(waitlist, w)
	}

	if waitlist == nil {
		waitlist = []models.Waitlist{}
	}
	c.JSON(http.StatusOK, waitlist)
}

func CreateWaitlist(c *gin.Context) {
	firstName := c.PostForm("firstname")
	lastName := c.PostForm("lastname")
	email := c.PostForm("email")
	phone := c.PostForm("phone")
	preferences := c.PostForm("preferences")
	status := "New"

	var newID int
	query := `
		INSERT INTO waitlist (first_name, last_name, email, phone, preferences, status)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id`

	err := database.Pool.QueryRow(c, query,
		firstName, lastName, email, phone, preferences, status,
	).Scan(&newID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create waitlist entry"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Joined waitlist", "id": newID})
}

func UpdateWaitlist(c *gin.Context) {
	id := c.Param("id")

	firstName := c.PostForm("firstname")
	lastName := c.PostForm("lastname")
	email := c.PostForm("email")
	phone := c.PostForm("phone")
	preferences := c.PostForm("preferences")
	status := c.PostForm("status")

	query := `
		UPDATE waitlist 
		SET first_name=$1, last_name=$2, email=$3, phone=$4, preferences=$5, status=$6, updated_at=NOW()
		WHERE id=$7`

	_, err := database.Pool.Exec(c, query, 
		firstName, lastName, email, phone, preferences, status, id,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update waitlist entry"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Waitlist entry updated"})
}

func DeleteWaitlist(c *gin.Context) {
	id := c.Param("id")
	_, err := database.Pool.Exec(c, "DELETE FROM waitlist WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete waitlist entry"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Waitlist entry deleted"})
}
