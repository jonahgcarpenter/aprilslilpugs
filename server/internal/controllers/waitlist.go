package controllers

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/models"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
)

func sendWaitlistNotification(entry *models.Waitlist) {
	rows, err := database.Pool.Query(context.Background(), "SELECT email FROM users")
	if err != nil {
		slog.Error("waitlist notification: failed to fetch recipients", "error", err)
		return
	}
	defer rows.Close()

	var recipients []string
	successCount := 0
	failureCount := 0
	for rows.Next() {
		var email string
		if err := rows.Scan(&email); err == nil {
			recipients = append(recipients, email)
		} else {
			slog.Warn("waitlist notification: failed to scan recipient", "error", err)
		}
	}

	if len(recipients) == 0 {
		slog.Info("waitlist notification: no recipients found, skipping")
		return
	}

	subject := "New Waitlist Entry - April's Lil Pugs"

	htmlBody := fmt.Sprintf(`
		<h2>New Waitlist Entry Received</h2>
		<p><strong>Name:</strong> %s %s</p>
		<p><strong>Email:</strong> %s</p>
		<p><strong>Phone Number:</strong> %s</p>
		<p><strong>Status:</strong> %s</p>
		<p><strong>Preferences/Notes:</strong> %s</p>
		<p><strong>Date Added:</strong> %s</p>
		<p>View the waitlist on the <a href="https://aprilslilpugs.com/admin">website</a>.</p>
	`,
		entry.FirstName,
		entry.LastName,
		entry.Email,
		entry.Phone,
		entry.Status,
		entry.Preferences,
		entry.CreatedAt.Format("2006-01-02 03:04 PM"),
	)

	slog.Info("waitlist notification: dispatching emails", "recipient_count", len(recipients))

	for _, email := range recipients {
		if err := utils.SendEmail([]string{email}, subject, htmlBody); err != nil {
			slog.Error("waitlist notification: failed to send email", "recipient", email, "error", err)
			failureCount++
			continue
		}

		successCount++
	}

	slog.Info("waitlist notification: email dispatch finished", "recipient_count", len(recipients), "success_count", successCount, "failure_count", failureCount)
}

func GetWaitlist(c *gin.Context) {
	query := `
		SELECT id, first_name, last_name, email, phone, preferences, status, created_at, updated_at
		FROM waitlist
		ORDER BY created_at ASC`

	rows, err := database.Pool.Query(c, query)
	if err != nil {
		slog.Error("get waitlist: database error", "error", err)
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
			slog.Debug("get waitlist: failed to scan row", "error", err)
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
		slog.Error("create waitlist: database error", "email", email, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create waitlist entry"})
		return
	}

	entry := models.Waitlist{
		FirstName:   firstName,
		LastName:    lastName,
		Email:       email,
		Phone:       phone,
		Preferences: preferences,
		Status:      status,
		CreatedAt:   time.Now(),
	}

	go sendWaitlistNotification(&entry)

	slog.Info("create waitlist: entry created", "id", newID, "email", email)
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
		slog.Error("update waitlist: database error", "id", id, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update waitlist entry"})
		return
	}

	slog.Info("update waitlist: entry updated", "id", id, "status", status)
	c.JSON(http.StatusOK, gin.H{"message": "Waitlist entry updated"})
}

func DeleteWaitlist(c *gin.Context) {
	id := c.Param("id")
	_, err := database.Pool.Exec(c, "DELETE FROM waitlist WHERE id=$1", id)
	if err != nil {
		slog.Error("delete waitlist: database error", "id", id, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete waitlist entry"})
		return
	}

	slog.Info("delete waitlist: entry deleted", "id", id)
	c.JSON(http.StatusOK, gin.H{"message": "Waitlist entry deleted"})
}
