package main

import (
	"os"
	"github.com/gin-gonic/gin"
	
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/config"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/controllers"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/middleware"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
)

func main() {
	cfg := config.Load()

	database.Connect(cfg.DatabaseURL)
	defer database.Close()

	r := gin.Default()

	os.MkdirAll("public/uploads/breeder-profiles", 0755)

	api := r.Group("/api")
	{
			// Auth
			api.POST("/auth/login", controllers.LoginUser)
			api.POST("/auth/logout", middleware.RequireAuth,controllers.LogoutUser)

			// User
			api.POST("/users", middleware.RequireAuth, controllers.CreateUser)
			api.GET("/users/:id", middleware.RequireAuth, controllers.GetUser)
			api.PATCH("/users/:id", middleware.RequireAuth, controllers.UpdateUser)
			api.DELETE("/users/:id", middleware.RequireAuth, controllers.DeleteUser)
	}

	r.Static("/assets", "./public/dist/assets")
	r.StaticFile("/logo.jpg", "./public/dist/logo.jpg")
	r.StaticFile("/background.png", "./public/dist/background.png")

	r.NoRoute(func(c *gin.Context) {
		c.File("./public/dist/index.html")
	})

	r.Run(":" + cfg.Port)
}
