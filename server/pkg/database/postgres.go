package database

import (
	"context"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func Connect(connectionString string) {
	if connectionString == "" {
		log.Fatal("Database connection string is empty")
	}

	config, err := pgxpool.ParseConfig(connectionString)
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

	log.Println("Connected to Database")
}

func Close() {
	if Pool != nil {
		Pool.Close()
	}
}
