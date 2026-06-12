package controllers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
)

func abortIfUploadTooLarge(c *gin.Context, err error) bool {
	if !errors.Is(err, utils.ErrUploadTooLarge) {
		return false
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "Uploaded file is too large"})
	return true
}
