package logger

import (
	"log/slog"
	"os"
)

// Init configures the default slog logger based on the environment.
// In development: TextHandler at Debug level (human-readable, coloured-free).
// In all other environments: JSONHandler at Info level (machine-parseable).
// After Init, call slog.Debug / slog.Info / slog.Warn / slog.Error directly
// anywhere in the codebase — no logger instance needs to be threaded through.
func Init(env string) {
	var handler slog.Handler

	if env == "development" {
		handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelDebug,
		})
	} else {
		handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelInfo,
		})
	}

	slog.SetDefault(slog.New(handler))
}
