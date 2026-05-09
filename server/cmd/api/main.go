package main

import (
	"log/slog"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"

	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/config"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/controllers"
	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/middleware"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/logger"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/stream"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
)

func main() {
	cfg := config.Load()

	logger.Init(cfg.LogLevel)

	if cfg.LogLevel != "debug" {
		gin.SetMode(gin.ReleaseMode)
	}

	database.Connect(cfg.DatabaseURL)
	defer database.Close()
	database.CreateTables()

	if err := utils.EnsureStorageDirectories(); err != nil {
		slog.Error("failed to prepare storage directories", "error", err)
		os.Exit(1)
	}

	slog.Info("storage directories ready")

	if err := stream.Initialize(stream.Config{
		RTMPAddr:      cfg.RTMPAddr,
		RTMPSAddr:     cfg.RTMPSAddr,
		RTMPSCertFile: cfg.RTMPSCertFile,
		RTMPSKeyFile:  cfg.RTMPSKeyFile,
		StreamHost:    cfg.StreamHost,
		StreamKey:     cfg.StreamKey,
		HLSPublicPath: cfg.HLSPublicPath,
	}); err != nil {
		slog.Error("failed to initialize stream manager", "error", err)
	}

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
		api.GET("/settings/stream/status", controllers.GetStreamStatus)
		api.PATCH("/settings/waitlist", middleware.RequireAuth, controllers.UpdateWaitlistStatus)
		api.PATCH("/settings/stream", middleware.RequireAuth, controllers.UpdateStreamStatus)

		// Files
		api.GET("/files", middleware.RequireAuth, controllers.GetFiles)
		api.POST("/files", middleware.RequireAuth, controllers.CreateFile)
		api.DELETE("/files/:id", middleware.RequireAuth, controllers.DeleteFile)
	}

	r.Static("/assets", "./public/dist/assets")
	r.Static(cfg.UploadsURLBase, filepath.Clean(cfg.StorageRoot))
	r.GET("/hls/*filepath", stream.Global.HandleHLS)
	r.StaticFile("/logo.jpg", "./public/dist/logo.jpg")
	r.StaticFile("/background.png", "./public/dist/background.png")
	r.StaticFile("/robots.txt", "./public/dist/robots.txt")
	r.StaticFile("/sitemap.xml", "./public/dist/sitemap.xml")

	r.NoRoute(func(c *gin.Context) {
		c.File("./public/dist/index.html")
	})

	slog.Info("server starting", "port", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		slog.Error("server failed", "port", cfg.Port, "error", err)
		os.Exit(1)
	}
}
