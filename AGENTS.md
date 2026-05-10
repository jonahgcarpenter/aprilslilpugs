# AGENTS.md

## Project Overview

Full-stack monorepo for a pug breeding business website (aprilslilpugs.com).

- **Frontend** (`client/`): React 19 + TypeScript + Vite 7 + Tailwind CSS v4
- **Backend** (`server/`): Go 1.25.5 + Gin + PostgreSQL (pgx/pgxpool, raw SQL)
- **Live Streaming**: built-in RTMP/RTMPS ingest + HLS playback endpoints managed by `server/pkg/stream`
- **Deployment**: Multi-stage Docker build; Go server serves the built SPA from `public/dist` plus uploads/HLS

No root-level package.json exists. All frontend tooling lives in `client/`.

## Build & Run Commands

### Frontend (`client/` directory)

```bash
# Install dependencies
cd client && npm install

# Development server (port 5173, proxies /api to localhost:4000)
cd client && npm run dev

# Type-check + production build
cd client && npm run build        # runs: tsc -b && vite build

# Lint (ESLint 9, flat config)
cd client && npm run lint         # runs: eslint .

# Preview production build locally
cd client && npm run preview
```

### Backend (`server/` directory)

```bash
# Build the server binary
cd server && go build -o ./tmp/main ./cmd/api/main.go

# Run the server
cd server && go run ./cmd/api/main.go

# Hot reload with Air (requires Air CLI)
cd server && air

# Build all packages quickly
cd server && go build ./...

# Vet and static analysis
cd server && go vet ./...
```

## Testing

There are currently **no tests** in this project (neither frontend nor backend). When adding tests:

- **Frontend**: No test framework is configured. If adding one, Vitest is recommended given the Vite build tool.
- **Backend**: Use standard Go `testing` package. Place test files alongside source with `_test.go` suffix. Air excludes `_test.go` files from hot reload.

## Project Structure

```
client/
  src/
    main.tsx              # Entry point (StrictMode, BrowserRouter, AuthProvider)
    App.tsx               # Route definitions
    context/auth.tsx      # JWT auth context (login/logout/token)
    hooks/                # SWR data hooks, including settings/files/stream status
    pages/                # Route page components
    components/           # Organized by domain (admin/, auth/, breeder/, dogs/, live/, etc.)
    index.css             # Tailwind entry and site-wide styles
  eslint.config.js        # ESLint 9 flat config
  tsconfig.app.json       # Strict TS config
  vite.config.ts          # Vite + Tailwind + dev proxy for /api, /uploads, /hls

server/
  cmd/api/main.go         # Entry point: config, DB init, routes, static file serving
  internal/
    config/config.go      # Env-based configuration
    controllers/          # HTTP handlers (auth, dogs, litters, puppies, waitlist, etc.)
    middleware/auth.go    # JWT Bearer token validation
    models/               # Struct definitions with json/form/binding tags
  pkg/
    database/             # pgxpool connection + auto table creation
    logger/               # Central slog setup based on LOG_LEVEL
    stream/               # RTMP/RTMPS ingest, HLS muxing, live status management
    utils/                # JWT, bcrypt, email, image/file storage, HA app events
```

## Code Style: Frontend (TypeScript/React)

### File Naming

- Components & pages: **kebab-case** (`update-breeder.tsx`, `our-adults.tsx`, `about-me.tsx`)
- Hooks: **lowercase, no separators** (`usedogs.ts`, `usebreeder.ts`, `usesettings.ts`)
- Context files: **lowercase** (`auth.tsx`)

### TypeScript Configuration

- **Strict mode** enabled with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- **`verbatimModuleSyntax`**: Use `import type { Foo }` for type-only imports
- **`erasableSyntaxOnly`**: No enums or parameter properties; use plain types/interfaces
- Target: ES2022, module: ESNext, JSX: react-jsx

### Component Patterns

- Pages use arrow functions: `const Home = () => { ... }; export default Home;`
- Structural components may use function declarations: `export default function Layout() { ... }`
- Both patterns exist; follow whichever is used in the file you're editing

### Data Fetching

- **SWR** for reads: custom hooks return `{ data, error, isLoading, mutate }` plus mutation functions
- **axios** for writes (POST/PATCH/DELETE), followed by `mutate()` to invalidate SWR cache
- Interfaces for API responses and frontend models are defined inline in hook files
- Separate `Input` interfaces for create/update payloads
- Auth token sent via axios interceptor (see `context/auth.tsx`)
- Stream status is fetched from dedicated settings/stream status endpoints

### Imports

- Named imports from libraries, relative paths (`../hooks/usedogs`)
- No path aliases (`@/`) configured
- Use `import type` for type-only imports (enforced by `verbatimModuleSyntax`)

### Styling

- **Tailwind CSS v4** with inline utility classes exclusively (no CSS modules, no styled-components)
- Dark theme: slate-900/950 backgrounds, blue/green/red accent colors
- Responsive: mobile-first with `sm:`, `md:` breakpoints

### Error Handling

- `console.error()` + `throw` in hooks
- `try/catch` in async mutation functions
- No centralized error boundary or toast notification system

## Code Style: Backend (Go)

### Package Layout

- `cmd/api/` - application entry point
- `internal/` - private application code (controllers, middleware, models, config)
- `pkg/` - reusable packages (database, logger, stream, utilities)

### Naming Conventions

- Standard Go conventions: PascalCase exported, camelCase unexported
- Controller functions: `VerbNoun` pattern (`GetDogs`, `CreateLitter`, `DeleteWaitlist`)
- Model structs use `json`, `form`, `binding`, and `db` field tags

### Import Grouping

Follow standard Go convention with three groups separated by blank lines:

1. Standard library
2. External packages (`github.com/gin-gonic/gin`, etc.)
3. Internal packages (`github.com/jonahgcarpenter/aprilslilpugs/server/...`)

### Database Patterns

- Global connection pool: `database.Pool` (pgxpool)
- Raw SQL with parameterized queries (`$1`, `$2`, etc.) -- no ORM
- JSONB columns for image arrays, marshaled/unmarshaled manually
- Auto-created tables via `pkg/database/tables.go`
- Schema includes PostgreSQL enum types for dog/litter/puppy/waitlist statuses

### Error Handling

- Check `err != nil`, respond with `c.JSON(http.StatusXxx, gin.H{"error": "message"})` and `return`
- `slog.Error(...)` + `os.Exit(1)` for fatal startup errors
- `slog.Debug/Info/Warn/Error(...)` for all runtime logging (structured key-value pairs)
- Non-critical errors (JSONB unmarshal, file deletion) are logged at Debug/Warn rather than silently ignored
- Distinguish expected `pgx.ErrNoRows` paths from real database errors in handlers

### Logging Pattern

- Logging is centralized through `server/pkg/logger` and the default `slog` logger
- `LOG_LEVEL=debug` uses `slog.TextHandler`; all other levels use `slog.JSONHandler`
- Prefer structured fields like `*_id`, `route_path`, `request_path`, `stream_path`, `remote_addr`, and `error`
- Runtime and background tasks (auth, mutations, stream state, app events) are logged; successful read requests generally are not

### Auth Pattern

- JWT Bearer tokens in `Authorization` header
- Server-side session table validated on each authenticated request
- 24-hour token and session expiry

### Streaming Pattern

- RTMP ingest listens on `RTMP_ADDR` and optional RTMPS ingest on `RTMPS_ADDR`
- HLS playback is served from `/hls/*filepath`
- Public stream status is exposed at `/api/settings/stream/status`
- Authenticated admin stream status is exposed at `/api/settings/stream/admin-status`
- Stream enablement is persisted in the `settings` table and restored on startup

## Environment Variables

The server reads config from env vars (see `server/internal/config/config.go`):
`PORT` (4000), `DATABASE_URL`, `JWT_SECRET`, `LOG_LEVEL`, `STORAGE_ROOT`, `UPLOADS_URL_BASE`,
`RTMP_ADDR`, `RTMPS_ADDR`, `RTMPS_CERT_FILE`, `RTMPS_KEY_FILE`, `STREAM_HOST`, `STREAM_KEY`, `HLS_PUBLIC_PATH`,
`HAS_BASE_URL`, `HAS_TOKEN`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_HOST`, `EMAIL_PORT`

`LOG_LEVEL` controls both the slog output level/format and the Gin mode:

- `debug`: TextHandler (human-readable), all levels visible, Gin in debug mode
- `info` (default): JSONHandler, Info+ visible, Gin in release mode
- `warn`: JSONHandler, Warn+ visible, Gin in release mode
- `error`: JSONHandler, Error only, Gin in release mode

Never commit `.env` files or secrets. The `server/.env` file is gitignored.

## CI/CD

- GitHub Actions workflow (`.github/workflows/docker-image.yml`) builds and pushes a Docker image to `ghcr.io` on release publish.
- No CI test or lint steps currently configured.
