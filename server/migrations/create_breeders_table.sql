CREATE TABLE IF NOT EXISTS breeders (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    story TEXT,
    profile_picture_id INT REFERENCES images(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS breeder_gallery (
    breeder_id INT REFERENCES breeders(id) ON DELETE CASCADE,
    image_id INT REFERENCES images(id) ON DELETE CASCADE,
    display_order INT DEFAULT 0,
    PRIMARY KEY (breeder_id, image_id)
);
