DO $$ BEGIN
    CREATE TYPE puppy_status AS ENUM ('Available', 'Reserved', 'Sold');
    CREATE TYPE puppy_gender AS ENUM ('Male', 'Female');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS puppies (
    id SERIAL PRIMARY KEY,
    litter_id INT REFERENCES litters(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    gender puppy_gender NOT NULL,
    status puppy_status DEFAULT 'Available',
    description TEXT,
    profile_picture VARCHAR(255),
    images TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
