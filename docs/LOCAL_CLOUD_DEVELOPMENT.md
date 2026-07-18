# Local Cloud Development

## Prerequisites

- Node.js 22 or compatible modern Node runtime.
- Docker with Docker Compose for real worker verification.

Docker is not available in the current workspace, so container build and end-to-end Ghostscript verification could not be completed here.

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
