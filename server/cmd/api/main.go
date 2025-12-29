package main

import (
	"github.com/gin-gonic/gin"
	
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/config"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/controllers"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/middleware"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
)

func main() {
	cfg := config.Load()

	database.Connect(cfg.DatabaseURL)
	defer database.Close()
	database.CreateTables()

	utils.InitMinio()

	r := gin.Default()

	api := r.Group("/api")
	{
			// Auth
			api.POST("/auth/login", controllers.LoginUser)
			api.POST("/auth/logout", middleware.RequireAuth, controllers.LogoutUser)

			// Users
			api.GET("/users/:id", middleware.RequireAuth, controllers.GetUser)
			api.POST("/users", middleware.RequireAuth, controllers.CreateUser)
			api.PATCH("/users/:id", middleware.RequireAuth, controllers.UpdateUser)
			api.DELETE("/users/:id", middleware.RequireAuth, controllers.DeleteUser)

			// Breeder
			api.GET("/breeder", controllers.GetBreeder)
			api.PATCH("/breeder", middleware.RequireAuth, controllers.UpdateBreeder)

			// Dogs
			api.GET("/dogs", controllers.GetDogs)
			api.GET("/dogs/:id", controllers.GetDog)
			api.POST("/dogs", middleware.RequireAuth, controllers.CreateDog)
			api.PATCH("/dogs/:id", middleware.RequireAuth, controllers.UpdateDog)
			api.DELETE("/dogs/:id", middleware.RequireAuth, controllers.DeleteDog)

			// Litters
			api.GET("/litters", controllers.GetLitters)
			api.GET("/litters/:id", controllers.GetLitter)
			api.POST("/litters", middleware.RequireAuth, controllers.CreateLitter)
			api.PATCH("/litters/:id", middleware.RequireAuth, controllers.UpdateLitter)
			api.DELETE("/litters/:id", middleware.RequireAuth, controllers.DeleteLitter)

			// Puppies
			api.GET("/puppies", controllers.GetPuppies)
      api.GET("/puppies/:id", controllers.GetPuppy)
			api.POST("/puppies", middleware.RequireAuth, controllers.CreatePuppy)
      api.PATCH("/puppies/:id", middleware.RequireAuth, controllers.UpdatePuppy)
      api.DELETE("/puppies/:id", middleware.RequireAuth, controllers.DeletePuppy)

			// Waitlist
			api.POST("/waitlist", controllers.CreateWaitlist)
			api.GET("/waitlist", middleware.RequireAuth, controllers.GetWaitlist)
			api.PATCH("/waitlist/:id", middleware.RequireAuth, controllers.UpdateWaitlist)
			api.DELETE("/waitlist/:id", middleware.RequireAuth, controllers.DeleteWaitlist)

			// Settings
			api.GET("/settings", controllers.GetSettings)
			api.PATCH("/settings/waitlist", middleware.RequireAuth, controllers.UpdateWaitlistStatus)
			api.PATCH("/settings/stream", middleware.RequireAuth, controllers.UpdateStreamStatus)

			// Files
			api.GET("/files", middleware.RequireAuth, controllers.GetFiles)
			api.POST("/files", middleware.RequireAuth, controllers.CreateFile)
			api.DELETE("/files/:id", middleware.RequireAuth, controllers.DeleteFile)
	}

	r.Static("/assets", "./public/dist/assets")
	r.StaticFile("/logo.jpg", "./public/dist/logo.jpg")
	r.StaticFile("/background.png", "./public/dist/background.png")

	r.NoRoute(func(c *gin.Context) {
		c.File("./public/dist/index.html")
	})

	r.Run(":" + cfg.Port)
}
