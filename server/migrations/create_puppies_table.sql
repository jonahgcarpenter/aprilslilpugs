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
    profile_picture_id INT REFERENCES images(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS puppy_gallery (
    puppy_id INT REFERENCES puppies(id) ON DELETE CASCADE,
    image_id INT REFERENCES images(id) ON DELETE CASCADE,
    display_order INT DEFAULT 0,
    PRIMARY KEY (puppy_id, image_id)
);
