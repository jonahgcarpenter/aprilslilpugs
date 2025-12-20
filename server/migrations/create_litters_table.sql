DO $$ BEGIN
    CREATE TYPE litter_status AS ENUM ('Planned', 'Available', 'Sold');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS litters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    external_mother_name VARCHAR(100),
    mother_id INT REFERENCES dogs(id) ON DELETE SET NULL,
    external_father_name VARCHAR(100),
    father_id INT REFERENCES dogs(id) ON DELETE SET NULL,
    birth_date DATE NOT NULL,
    available_date DATE NOT NULL,
    profile_picture VARCHAR(255),
    images TEXT[],
    status litter_status DEFAULT 'Planned',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
