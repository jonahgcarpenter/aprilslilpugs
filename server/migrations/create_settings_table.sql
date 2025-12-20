CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    waitlist_enabled BOOLEAN DEFAULT true,
    stream_enabled BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO settings (id, waitlist_enabled, stream_enabled)
VALUES (1, true, false, false)
ON CONFLICT (id) DO NOTHING;
