package utils

import "errors"

const (
	MaxImageUploadBytes       = 10 << 20
	MaxPrivateFileUploadBytes = 25 << 20
	MaxImagePixels            = 20_000_000
)

var ErrUploadTooLarge = errors.New("uploaded file is too large")
