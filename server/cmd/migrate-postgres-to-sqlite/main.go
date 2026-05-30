package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log/slog"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/config"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/logger"
)

type tableSpec struct {
	name    string
	columns []string
}

var tables = []tableSpec{
	{
		name: "users",
		columns: []string{
			"id", "first_name", "last_name", "email", "password_hash", "phone_number", "created_at", "updated_at",
		},
	},
	{
		name: "breeders",
		columns: []string{
			"id", "first_name", "last_name", "email", "phone_number", "location", "story", "profile_picture", "gallery", "created_at", "updated_at",
		},
	},
	{
		name: "dogs",
		columns: []string{
			"id", "name", "gender", "description", "birth_date", "death_at", "profile_picture", "gallery", "created_at", "updated_at",
		},
	},
	{
		name: "litters",
		columns: []string{
			"id", "name", "external_mother_name", "mother_id", "external_father_name", "father_id", "birth_date", "available_date", "profile_picture", "gallery", "status", "created_at", "updated_at",
		},
	},
	{
		name: "puppies",
		columns: []string{
			"id", "litter_id", "name", "color", "gender", "status", "description", "profile_picture", "gallery", "created_at", "updated_at",
		},
	},
	{
		name: "waitlist",
		columns: []string{
			"id", "first_name", "last_name", "email", "phone", "preferences", "status", "created_at", "updated_at",
		},
	},
	{
		name: "settings",
		columns: []string{
			"id", "waitlist_enabled", "stream_enabled", "updated_at",
		},
	},
	{
		name: "files",
		columns: []string{
			"id", "name", "url", "created_at", "updated_at",
		},
	},
}

func main() {
	replace := flag.Bool("replace", false, "delete existing SQLite rows before importing")
	includeSessions := flag.Bool("include-sessions", false, "copy active login sessions too")
	flag.Parse()

	if err := godotenv.Load(); err != nil {
		slog.Debug("migrate: no .env file found, relying on system environment variables")
	}

	cfg := config.Load()
	logger.Init(cfg.LogLevel)

	if cfg.DatabaseURL == "" {
		slog.Error("DATABASE_URL is required as the PostgreSQL source")
		os.Exit(1)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	source, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		slog.Error("migrate: failed to connect to postgres", "error", err)
		os.Exit(1)
	}
	defer source.Close()

	if err := source.Ping(ctx); err != nil {
		slog.Error("migrate: failed to ping postgres", "error", err)
		os.Exit(1)
	}

	database.Connect("", cfg.DatabaseRoot)
	defer database.Close()
	database.CreateTables()

	importTables := append([]tableSpec{}, tables...)
	if *includeSessions {
		importTables = append(importTables, tableSpec{
			name:    "sessions",
			columns: []string{"id", "user_id", "user_agent", "ip_address", "expires_at", "created_at"},
		})
	}

	if err := ensureDestinationIsEmpty(ctx, importTables, *replace); err != nil {
		slog.Error("migrate: destination check failed", "error", err)
		os.Exit(1)
	}

	if *replace {
		if err := clearDestination(ctx, importTables); err != nil {
			slog.Error("migrate: failed to clear sqlite destination", "error", err)
			os.Exit(1)
		}
	}

	for _, table := range importTables {
		count, err := copyTable(ctx, source, table)
		if err != nil {
			slog.Error("migrate: failed to copy table", "table", table.name, "error", err)
			os.Exit(1)
		}
		slog.Info("migrate: table copied", "table", table.name, "row_count", count)
	}

	slog.Info("migrate: postgres to sqlite import complete", "database_root", cfg.DatabaseRoot)
}

func ensureDestinationIsEmpty(ctx context.Context, importTables []tableSpec, replace bool) error {
	if replace {
		return nil
	}

	for _, table := range importTables {
		var count int
		if err := database.Pool.QueryRow(ctx, fmt.Sprintf("SELECT COUNT(*) FROM %s", table.name)).Scan(&count); err != nil {
			return fmt.Errorf("count %s rows: %w", table.name, err)
		}
		if count > 0 {
			return fmt.Errorf("sqlite table %s already has %d rows; rerun with -replace to overwrite", table.name, count)
		}
	}

	return nil
}

func clearDestination(ctx context.Context, importTables []tableSpec) error {
	for i := len(importTables) - 1; i >= 0; i-- {
		if _, err := database.Pool.Exec(ctx, fmt.Sprintf("DELETE FROM %s", importTables[i].name)); err != nil {
			return fmt.Errorf("delete %s: %w", importTables[i].name, err)
		}
	}

	names := make([]string, 0, len(importTables))
	for _, table := range importTables {
		names = append(names, fmt.Sprintf("'%s'", table.name))
	}
	if _, err := database.Pool.Exec(ctx, fmt.Sprintf("DELETE FROM sqlite_sequence WHERE name IN (%s)", strings.Join(names, ", "))); err != nil {
		return fmt.Errorf("reset sqlite autoincrement counters: %w", err)
	}

	return nil
}

func copyTable(ctx context.Context, source *pgxpool.Pool, table tableSpec) (int, error) {
	columns := strings.Join(table.columns, ", ")
	selectQuery := fmt.Sprintf("SELECT %s FROM %s ORDER BY id", columns, table.name)
	rows, err := source.Query(ctx, selectQuery)
	if err != nil {
		return 0, err
	}
	defer rows.Close()

	insertQuery := fmt.Sprintf(
		"INSERT INTO %s (%s) VALUES (%s)",
		table.name,
		columns,
		placeholders(len(table.columns)),
	)

	count := 0
	for rows.Next() {
		values, err := rows.Values()
		if err != nil {
			return count, err
		}

		for i, value := range values {
			switch typed := value.(type) {
			case []byte:
				values[i] = string(typed)
			case map[string]any, []any:
				encoded, err := json.Marshal(typed)
				if err != nil {
					return count, fmt.Errorf("marshal %s JSON column %s: %w", table.name, table.columns[i], err)
				}
				values[i] = string(encoded)
			}
		}

		if _, err := database.Pool.Exec(ctx, insertQuery, values...); err != nil {
			return count, err
		}
		count++
	}

	if err := rows.Err(); err != nil {
		return count, err
	}

	return count, nil
}

func placeholders(count int) string {
	parts := make([]string, count)
	for i := range parts {
		parts[i] = fmt.Sprintf("$%d", i+1)
	}
	return strings.Join(parts, ", ")
}
