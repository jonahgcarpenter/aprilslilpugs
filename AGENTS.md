# AGENTS.md

## Project Overview

Full-stack monorepo for a pug breeding business website (aprilslilpugs.com).

- **Frontend** (`client/`): React 19 + TypeScript + Vite 7 + Tailwind CSS v4
- **Backend** (`server/`): Go 1.25 + Gin + PostgreSQL (pgx/pgxpool, raw SQL)
- **Deployment**: Multi-stage Docker build, served as single Go binary with embedded SPA

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

# Run all Go tests
cd server && go test ./...

# Run a single test file or function
cd server && go test ./internal/controllers/ -run TestGetDogs -v

# Vet and static analysis
cd server && go vet ./...
```

### Docker

```bash
# Build the full-stack image
docker build -t aprilslilpugs .

# Run (needs DATABASE_URL and other env vars)
docker run -p 4000:4000 --env-file server/.env aprilslilpugs
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
    hooks/                # SWR data-fetching hooks (usedogs.ts, uselitters.ts, etc.)
    pages/                # Route page components
    components/           # Organized by domain (admin/, dogs/, litters/, etc.)
  eslint.config.js        # ESLint 9 flat config
  tsconfig.app.json       # Strict TS config
  vite.config.ts          # Vite + Tailwind + dev proxy

server/
  cmd/api/main.go         # Entry point: config, DB init, routes, static file serving
  internal/
    config/config.go      # Env-based configuration
    controllers/          # HTTP handlers (auth, dogs, litters, puppies, waitlist, etc.)
    middleware/auth.go    # JWT Bearer token validation
    models/               # Struct definitions with json/form/binding tags
  pkg/
    database/             # pgxpool connection + auto table creation
    utils/                # JWT, bcrypt, email, image processing, file storage
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
- `pkg/` - reusable packages (database, utilities)

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

### Error Handling

- Check `err != nil`, respond with `c.JSON(http.StatusXxx, gin.H{"error": "message"})` and `return`
- `log.Fatal` / `log.Fatalf` for fatal startup errors
- `fmt.Println` / `fmt.Printf` for runtime logging (no structured logger)
- Some non-critical errors silently ignored with `_ = ...`

### Auth Pattern

- JWT Bearer tokens in `Authorization` header
- Server-side session table validated on each authenticated request
- 24-hour token and session expiry

## Environment Variables

The server reads config from env vars (see `server/internal/config/config.go`):
`PORT` (4000), `DATABASE_URL`, `JWT_SECRET`, `GO_ENV`, `STORAGE_ROOT`, `UPLOADS_URL_BASE`,
`STREAM_URL`, `HAS_BASE_URL`, `HAS_TOKEN`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_HOST`, `EMAIL_PORT`

Never commit `.env` files or secrets. The `server/.env` file is gitignored.

## CI/CD

- GitHub Actions workflow (`.github/workflows/docker-image.yml`) builds and pushes a Docker image to `ghcr.io` on release publish.
- No CI test or lint steps currently configured.
