package database

import (
	"context"
	"log"
)

func CreateTables() {
    ctx := context.Background()

		type Schema struct {
			Name  string
			Query string
		}

    tables := []Schema{
			{
				Name: "breeders",
				Query: `
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
				);`,
			},
			{
				Name: "dog_gender Enum",
				Query: `
				DO $$ BEGIN
					CREATE TYPE dog_gender AS ENUM ('Male', 'Female');
				EXCEPTION
					WHEN duplicate_object THEN null;
				END $$;`,
			},
			{
				Name: "dogs",
				Query: `
				CREATE TABLE IF NOT EXISTS dogs (
					id SERIAL PRIMARY KEY,
					name VARCHAR(100) NOT NULL,
					gender dog_gender NOT NULL,
					description TEXT,
					birth_date DATE NOT NULL,
					profile_picture JSONB DEFAULT '{}'::jsonb,
					gallery JSONB DEFAULT '[]'::jsonb,
					created_at TIMESTAMPTZ DEFAULT NOW(),
					updated_at TIMESTAMPTZ DEFAULT NOW()
				);`,
			},
		}

    for _, item := range tables {
			_, err := Pool.Exec(ctx, item.Query)
			if err != nil {
				log.Fatalf("Unable to create '%s': %v\n", item.Name, err)
			}
			log.Printf("Successfully ensured '%s'\n", item.Name)
		}
}
