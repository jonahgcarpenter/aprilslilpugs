package database

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func Connect() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set in .env")
	}

	config, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		log.Fatal("Unable to parse DATABASE_URL:", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	Pool, err = pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		log.Fatal("Unable to connect to database:", err)
	}

	if err := Pool.Ping(ctx); err != nil {
		log.Fatal("Unable to ping database:", err)
	}

	log.Println("Connected to PostgreSQL!")
}

func Close() {
	if Pool != nil {
		Pool.Close()
	}
}
