DO $$ BEGIN
    CREATE TYPE dog_gender AS ENUM ('Male', 'Female');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS dogs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender dog_gender NOT NULL,
    description TEXT,
    birth_date DATE NOT NULL,
    profile_picture_id INT REFERENCES images(id) ON DELETE SET NULL,
    images_ids TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
