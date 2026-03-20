# April's Lil Pugs

A custom, full-stack website built for [April's Lil Pugs](https://aprilslilpugs.com), tailored to manage dog breeding operations, puppy galleries, and customer interactions.

## Tech Stack

### Frontend

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** TypeScript

### Backend

- **Language:** Go (Golang 1.25+)
- **Framework:** [Gin Gonic](https://github.com/gin-gonic/gin)
- **Database:** PostgreSQL

## Features

- **Breeder Management:** Admin tools to manage breeder profiles and "About Me" sections.
- **Dog & Litter Tracking:** Full CRUD capabilities for managing adult dogs, litters, and individual puppies.
- **Waitlist System:** Automated waitlist management for prospective owners.
- **Live Streaming:** Integrated live stream viewer for puppy cams (HLS support).
- **Gallery:** Dynamic image gallery for past litters and available puppies.
- **Authentication:** Secure admin login to protect management routes.

## Local Upload Storage

- Uploaded media is stored on the backend filesystem and served from `/uploads`.
- In Docker, mount a persistent volume to `/app/storage` so uploads survive container restarts.
- Set `STORAGE_ROOT` if you need a different storage path and `UPLOADS_URL_BASE` if you need a different public route.
- Back up the uploads volume alongside PostgreSQL.

## Legacy Asset Migration

- A one-time migration command is available at `server/cmd/migrate-storage`.
- It copies legacy MinIO/S3-compatible objects into local storage and rewrites stored URLs to `/uploads/...`.
- Run it with `go run ./cmd/migrate-storage --dry-run` first, then rerun without `--dry-run` once the persistent volume is mounted.
