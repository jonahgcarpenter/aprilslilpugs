package logger

import (
	"log/slog"
	"os"
)

// Init configures the default slog logger based on the LOG_LEVEL env var.
//
// Valid values: "debug", "info", "warn", "error" (case-insensitive).
// Defaults to "info" for any unrecognised value.
//
// "debug" uses a human-readable TextHandler; all other levels use a
// machine-parseable JSONHandler suitable for log aggregators.
//
// After Init, call slog.Debug / slog.Info / slog.Warn / slog.Error directly
// anywhere in the codebase — no logger instance needs to be threaded through.
func Init(level string) {
	var slogLevel slog.Level

	switch level {
	case "debug":
		slogLevel = slog.LevelDebug
	case "info":
		slogLevel = slog.LevelInfo
	case "warn":
		slogLevel = slog.LevelWarn
	case "error":
		slogLevel = slog.LevelError
	default:
		slogLevel = slog.LevelInfo
	}

	opts := &slog.HandlerOptions{Level: slogLevel}

	var handler slog.Handler
	if level == "debug" {
		handler = slog.NewTextHandler(os.Stdout, opts)
	} else {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	}

	slog.SetDefault(slog.New(handler))

	if level != "debug" && level != "info" && level != "warn" && level != "error" {
		slog.Warn("unrecognised LOG_LEVEL, defaulting to info", "provided", level)
	}
}
