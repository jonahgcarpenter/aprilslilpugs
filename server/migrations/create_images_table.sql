CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
