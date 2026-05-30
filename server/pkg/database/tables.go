package database

import (
	"context"
	"log/slog"
	"os"
)

type schema struct {
	Name  string
	Query string
}

func CreateTables() {
	ctx := context.Background()
	schemas := postgresSchemas()
	if Pool.Dialect() == DialectSQLite {
		schemas = sqliteSchemas()
	}

	for _, item := range schemas {
		_, err := Pool.Exec(ctx, item.Query)
		if err != nil {
			slog.Error("unable to create schema object", "name", item.Name, "error", err)
			os.Exit(1)
		}
		slog.Debug("schema object ensured", "name", item.Name)
	}
}

func postgresSchemas() []schema {
	return []schema{
		{
			Name: "users",
			Query: `
				CREATE TABLE IF NOT EXISTS users (
					id SERIAL PRIMARY KEY,
					first_name VARCHAR(100) NOT NULL,
					last_name VARCHAR(100) NOT NULL,
					email VARCHAR(255) UNIQUE NOT NULL,
					password_hash VARCHAR(255) NOT NULL,
					phone_number VARCHAR(50) NOT NULL,
					created_at TIMESTAMPTZ DEFAULT NOW(),
					updated_at TIMESTAMPTZ DEFAULT NOW()
				);`,
		},
		{
			Name: "sessions",
			Query: `
				CREATE TABLE IF NOT EXISTS sessions (
					id SERIAL PRIMARY KEY,
					user_id INT REFERENCES users(id) ON DELETE CASCADE,
					user_agent VARCHAR(255),
					ip_address VARCHAR(45),
					expires_at TIMESTAMPTZ NOT NULL,
					created_at TIMESTAMPTZ DEFAULT NOW()
				);`,
		},
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
					death_at DATE,
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
		{
			Name: "waitlist_status Enum",
			Query: `
				DO $$ BEGIN
					CREATE TYPE waitlist_status AS ENUM ('New', 'Contacted', 'Complete');
				EXCEPTION
					WHEN duplicate_object THEN null;
				END $$;`,
		},
		{
			Name: "waitlist",
			Query: `
				CREATE TABLE IF NOT EXISTS waitlist (
					id SERIAL PRIMARY KEY,
					first_name VARCHAR(100) NOT NULL,
					last_name VARCHAR(100) NOT NULL,
					email VARCHAR(150) NOT NULL,
					phone VARCHAR(50),
					preferences TEXT,
					status waitlist_status NOT NULL DEFAULT 'New',
					created_at TIMESTAMPTZ DEFAULT NOW(),
					updated_at TIMESTAMPTZ DEFAULT NOW()
				);`,
		},
		{
			Name: "settings",
			Query: `
				CREATE TABLE IF NOT EXISTS settings (
					id SERIAL PRIMARY KEY,
					waitlist_enabled BOOLEAN DEFAULT false,
					stream_enabled BOOLEAN DEFAULT false,
					updated_at TIMESTAMPTZ DEFAULT NOW()
				);`,
		},
		{
			Name: "files",
			Query: `
				CREATE TABLE IF NOT EXISTS files (
					id SERIAL PRIMARY KEY,
					name VARCHAR(255) NOT NULL,
					url VARCHAR(500) NOT NULL,
					created_at TIMESTAMPTZ DEFAULT NOW(),
					updated_at TIMESTAMPTZ DEFAULT NOW()
				);`,
		},
	}
}

func sqliteSchemas() []schema {
	return []schema{
		{
			Name: "users",
			Query: `
				CREATE TABLE IF NOT EXISTS users (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					first_name TEXT NOT NULL,
					last_name TEXT NOT NULL,
					email TEXT UNIQUE NOT NULL,
					password_hash TEXT NOT NULL,
					phone_number TEXT NOT NULL,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);`,
		},
		{
			Name: "sessions",
			Query: `
				CREATE TABLE IF NOT EXISTS sessions (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
					user_agent TEXT,
					ip_address TEXT,
					expires_at DATETIME NOT NULL,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);`,
		},
		{
			Name: "breeders",
			Query: `
				CREATE TABLE IF NOT EXISTS breeders (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					first_name TEXT NOT NULL,
					last_name TEXT NOT NULL,
					email TEXT UNIQUE NOT NULL,
					phone_number TEXT NOT NULL,
					location TEXT NOT NULL,
					story TEXT,
					profile_picture TEXT DEFAULT '{}',
					gallery TEXT DEFAULT '[]',
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);`,
		},
		{
			Name: "dogs",
			Query: `
				CREATE TABLE IF NOT EXISTS dogs (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					name TEXT NOT NULL,
					gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
					description TEXT,
					birth_date DATE NOT NULL,
					death_at DATE,
					profile_picture TEXT DEFAULT '{}',
					gallery TEXT DEFAULT '[]',
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);`,
		},
		{
			Name: "litters",
			Query: `
				CREATE TABLE IF NOT EXISTS litters (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					name TEXT NOT NULL,
					external_mother_name TEXT,
					mother_id INTEGER REFERENCES dogs(id) ON DELETE SET NULL,
					external_father_name TEXT,
					father_id INTEGER REFERENCES dogs(id) ON DELETE SET NULL,
					birth_date DATE NOT NULL,
					available_date DATE NOT NULL,
					profile_picture TEXT DEFAULT '{}',
					gallery TEXT DEFAULT '[]',
					status TEXT DEFAULT 'Planned' CHECK (status IN ('Planned', 'Available', 'Sold')),
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);`,
		},
		{
			Name: "puppies",
			Query: `
				CREATE TABLE IF NOT EXISTS puppies (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					litter_id INTEGER REFERENCES litters(id) ON DELETE CASCADE,
					name TEXT NOT NULL,
					color TEXT NOT NULL,
					gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
					status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Sold')),
					description TEXT,
					profile_picture TEXT DEFAULT '{}',
					gallery TEXT DEFAULT '[]',
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);`,
		},
		{
			Name: "waitlist",
			Query: `
				CREATE TABLE IF NOT EXISTS waitlist (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					first_name TEXT NOT NULL,
					last_name TEXT NOT NULL,
					email TEXT NOT NULL,
					phone TEXT,
					preferences TEXT,
					status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Complete')),
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);`,
		},
		{
			Name: "settings",
			Query: `
				CREATE TABLE IF NOT EXISTS settings (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					waitlist_enabled INTEGER DEFAULT 0,
					stream_enabled INTEGER DEFAULT 0,
					updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);`,
		},
		{
			Name: "files",
			Query: `
				CREATE TABLE IF NOT EXISTS files (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					name TEXT NOT NULL,
					url TEXT NOT NULL,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);`,
		},
	}
}
