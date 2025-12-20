package main

import (
	"github.com/gin-gonic/gin"
	
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/config"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
)

func main() {
	cfg := config.Load()

	database.Connect(cfg.DatabaseURL)
	defer database.Close()

	r := gin.Default()

	r.Static("/assets", "./public/dist/assets")
	r.StaticFile("/logo.jpg", "./public/dist/logo.jpg")
	r.StaticFile("/background.png", "./public/dist/background.png")

	r.NoRoute(func(c *gin.Context) {
		c.File("./public/dist/index.html")
	})

	r.Run(":" + cfg.Port)
}
