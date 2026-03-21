package database

import (
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func Connect(connectionString string) {
	if connectionString == "" {
		slog.Error("database connection string is empty")
		os.Exit(1)
	}

	config, err := pgxpool.ParseConfig(connectionString)
	if err != nil {
		slog.Error("unable to parse DATABASE_URL", "error", err)
		os.Exit(1)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	Pool, err = pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		slog.Error("unable to connect to database", "error", err)
		os.Exit(1)
	}

	if err := Pool.Ping(ctx); err != nil {
		slog.Error("unable to ping database", "error", err)
		os.Exit(1)
	}

	slog.Info("connected to database")
}

func Close() {
	if Pool != nil {
		Pool.Close()
	}
}
