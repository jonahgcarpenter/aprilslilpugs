package database

import (
	"context"
	"log"
)

func CreateTables() {
	ctx := context.Background()

	createBreedersTable := `
	CREATE TABLE IF NOT EXISTS breeders (
		id SERIAL PRIMARY KEY,
		first_name VARCHAR(100) NOT NULL,
		last_name VARCHAR(100) NOT NULL,
		email VARCHAR(255) UNIQUE NOT NULL,
		phone_number VARCHAR(50) NOT NULL,
		location VARCHAR(255) NOT NULL,
		story TEXT,
		profile_picture JSONB DEFAULT '{}'::jsonb,
		gallery JSONB DEFAULT '[]'::jsonb,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW()
	);`

	_, err := Pool.Exec(ctx, createBreedersTable)
	if err != nil {
		log.Fatalf("Unable to create 'breeders' table: %v\n", err)
	}

	log.Println("Tables created successfully")
}
