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
			{
				Name: "litter_status Enum",
				Query: `
				DO $$ BEGIN
					CREATE TYPE litter_status AS ENUM ('Planned', 'Available', 'Sold');
				EXCEPTION
					WHEN duplicate_object THEN null;
				END $$;`,
			},
			{
				Name: "litters",
				Query: `
				CREATE TABLE IF NOT EXISTS litters (
					id SERIAL PRIMARY KEY,
					name VARCHAR(100) NOT NULL,
					external_mother_name VARCHAR(100),
					mother_id INT REFERENCES dogs(id) ON DELETE SET NULL,
					external_father_name VARCHAR(100),
					father_id INT REFERENCES dogs(id) ON DELETE SET NULL,
					birth_date DATE NOT NULL,
					available_date DATE NOT NULL,
					profile_picture JSONB DEFAULT '{}'::jsonb,
					gallery JSONB DEFAULT '[]'::jsonb,
					status litter_status DEFAULT 'Planned',
					created_at TIMESTAMPTZ DEFAULT NOW(),
					updated_at TIMESTAMPTZ DEFAULT NOW()
				);`,
			},
			{
				Name: "puppy_status Enum",
				Query: `
				DO $$ BEGIN
					CREATE TYPE puppy_status AS ENUM ('Available', 'Reserved', 'Sold');
				EXCEPTION
					WHEN duplicate_object THEN null;
				END $$;`,
			},
			{
				Name: "puppy_gender Enum",
				Query: `
				DO $$ BEGIN
					CREATE TYPE puppy_gender AS ENUM ('Male', 'Female');
				EXCEPTION
					WHEN duplicate_object THEN null;
				END $$;`,
			},
			{
				Name: "puppies",
				Query: `
				CREATE TABLE IF NOT EXISTS puppies (
					id SERIAL PRIMARY KEY,
					litter_id INT REFERENCES litters(id) ON DELETE CASCADE,
					name VARCHAR(100) NOT NULL,
					color VARCHAR(50) NOT NULL,
					gender puppy_gender NOT NULL,
					status puppy_status DEFAULT 'Available',
					description TEXT,
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
