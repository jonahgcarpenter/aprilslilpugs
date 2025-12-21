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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dog_gallery (
    dog_id INT REFERENCES dogs(id) ON DELETE CASCADE,
    image_id INT REFERENCES images(id) ON DELETE CASCADE,
    display_order INT DEFAULT 0,
    PRIMARY KEY (dog_id, image_id)
);
