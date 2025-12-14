package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	database.Connect()
	defer database.Close()

	r := gin.Default()

	r.Static("/assets", "./public/dist/assets")
	r.StaticFile("/logo.jpg", "./public/dist/logo.jpg")
	r.StaticFile("/background.png", "./public/dist/background.png")

	r.NoRoute(func(c *gin.Context) {
		c.File("./public/dist/index.html")
	})

	r.Run(":4000")
}
