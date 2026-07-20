# Local Cloud Development

## Prerequisites

- Node.js 22 or compatible modern Node runtime.
- Docker with Docker Compose for real worker verification.

Docker with Ghostscript is required for real Compress PDF verification.

## Frontend

```bash
npm install
npm run dev
```

Set:

```bash
VITE_PAPERLANE_API_BASE_URL=http://localhost:8787
```

## API and Worker

```bash
npm run server:build
npm run api:start
npm run worker:start
```

For the worker to produce real compressed output outside Docker, Ghostscript must be installed and `PAPERLANE_GHOSTSCRIPT_BINARY` must point to the executable.

## Docker

```bash
docker compose up --build
```

The API is exposed on `localhost:8787`. The worker and shared temporary storage are internal to the Compose project.

## Target-Size Checks

Use a harmless image-heavy PDF when testing target maximum size mode. Confirm:

- The target must be smaller than the selected PDF.
- A reachable target reports `targetMet: true`.
- An unreachable target still returns the smallest valid output and reports `targetMet: false`.
- Downloaded outputs open as PDFs and preserve the original page count.
- Delete now removes the output and disables further download.
