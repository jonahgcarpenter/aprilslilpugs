package database

import (
	"context"
	"database/sql"
	"log/slog"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	_ "modernc.org/sqlite"
)

const sqliteDatabaseName = "aprilslilpugs.db"

var placeholderPattern = regexp.MustCompile(`\$\d+`)

type Dialect string

const (
	DialectPostgres Dialect = "postgres"
	DialectSQLite   Dialect = "sqlite"
)

type DB struct {
	dialect Dialect
	pg      *pgxpool.Pool
	sqlite  *sql.DB
}

type Rows interface {
	Close()
	Next() bool
	Scan(dest ...any) error
	Err() error
}

type Row interface {
	Scan(dest ...any) error
}

type Result interface {
	RowsAffected() int64
}

type sqlRow struct {
	row *sql.Row
}

type sqlRows struct {
	rows *sql.Rows
}

type sqlResult struct {
	result sql.Result
}

var Pool *DB

func Connect(connectionString, databaseRoot string) {
	if connectionString != "" {
		connectPostgres(connectionString)
		return
	}

	connectSQLite(databaseRoot)
}

func connectPostgres(connectionString string) {
	config, err := pgxpool.ParseConfig(connectionString)
	if err != nil {
		slog.Error("unable to parse DATABASE_URL", "error", err)
		os.Exit(1)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		slog.Error("unable to connect to postgres database", "error", err)
		os.Exit(1)
	}

	if err := pool.Ping(ctx); err != nil {
		slog.Error("unable to ping postgres database", "error", err)
		os.Exit(1)
	}

	Pool = &DB{dialect: DialectPostgres, pg: pool}
	slog.Info("connected to postgres database")
}

func connectSQLite(databaseRoot string) {
	if databaseRoot == "" {
		databaseRoot = "./database"
	}

	if err := os.MkdirAll(databaseRoot, 0o755); err != nil {
		slog.Error("unable to create sqlite database directory", "path", databaseRoot, "error", err)
		os.Exit(1)
	}

	databasePath := filepath.Join(databaseRoot, sqliteDatabaseName)
	db, err := sql.Open("sqlite", databasePath)
	if err != nil {
		slog.Error("unable to open sqlite database", "path", databasePath, "error", err)
		os.Exit(1)
	}

	db.SetMaxOpenConns(1)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		slog.Error("unable to ping sqlite database", "path", databasePath, "error", err)
		os.Exit(1)
	}

	if _, err := db.ExecContext(ctx, "PRAGMA foreign_keys = ON"); err != nil {
		slog.Error("unable to enable sqlite foreign keys", "error", err)
		os.Exit(1)
	}

	Pool = &DB{dialect: DialectSQLite, sqlite: db}
	slog.Info("connected to sqlite database", "path", databasePath)
}

func Close() {
	if Pool == nil {
		return
	}

	if Pool.pg != nil {
		Pool.pg.Close()
	}
	if Pool.sqlite != nil {
		if err := Pool.sqlite.Close(); err != nil {
			slog.Warn("failed to close sqlite database", "error", err)
		}
	}
}

func (db *DB) Dialect() Dialect {
	if db == nil {
		return ""
	}
	return db.dialect
}

func (db *DB) Query(ctx context.Context, query string, args ...any) (Rows, error) {
	if db.dialect == DialectPostgres {
		return db.pg.Query(ctx, query, args...)
	}

	rows, err := db.sqlite.QueryContext(ctx, normalizeSQLiteQuery(query), args...)
	if err != nil {
		return nil, err
	}
	return sqlRows{rows: rows}, nil
}

func (db *DB) QueryRow(ctx context.Context, query string, args ...any) Row {
	if db.dialect == DialectPostgres {
		return db.pg.QueryRow(ctx, query, args...)
	}

	return sqlRow{row: db.sqlite.QueryRowContext(ctx, normalizeSQLiteQuery(query), args...)}
}

func (db *DB) Exec(ctx context.Context, query string, args ...any) (Result, error) {
	if db.dialect == DialectPostgres {
		return db.pg.Exec(ctx, query, args...)
	}

	result, err := db.sqlite.ExecContext(ctx, normalizeSQLiteQuery(query), args...)
	if err != nil {
		return nil, err
	}

	return sqlResult{result: result}, nil
}

func (r sqlRow) Scan(dest ...any) error {
	err := r.row.Scan(dest...)
	if err == sql.ErrNoRows {
		return pgx.ErrNoRows
	}
	return err
}

func (r sqlRows) Close() {
	if err := r.rows.Close(); err != nil {
		slog.Warn("failed to close sqlite rows", "error", err)
	}
}

func (r sqlRows) Next() bool {
	return r.rows.Next()
}

func (r sqlRows) Scan(dest ...any) error {
	return r.rows.Scan(dest...)
}

func (r sqlRows) Err() error {
	return r.rows.Err()
}

func (r sqlResult) RowsAffected() int64 {
	count, err := r.result.RowsAffected()
	if err != nil {
		return 0
	}
	return count
}

func normalizeSQLiteQuery(query string) string {
	query = placeholderPattern.ReplaceAllString(query, "?")
	query = strings.ReplaceAll(query, "NOW()", "CURRENT_TIMESTAMP")
	return query
}

var _ Result = pgconn.CommandTag{}
