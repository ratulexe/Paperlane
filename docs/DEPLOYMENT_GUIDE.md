# Deployment Guide

Paperlane cloud processing must be deployed as separate components.

## Components

- Static frontend: Vite build output.
- API service: Node.js API from `server/api`.
- Worker container: Node.js worker with Ghostscript installed.
- Temporary storage: private object storage or a provider-specific adapter replacing the local filesystem adapter.
- Queue: reliable queue implementation; Phase 9 local development uses a shared filesystem queue abstraction.

The worker cannot run inside a static Vercel frontend deployment.

## Required Configuration

- `VITE_PAPERLANE_API_BASE_URL`
- `PAPERLANE_API_PORT`
- `PAPERLANE_ALLOWED_ORIGINS`
- `PAPERLANE_STORAGE_ROOT` or production storage adapter configuration
- `PAPERLANE_MAX_UPLOAD_BYTES`
- `PAPERLANE_JOB_TIMEOUT_MS`
- `PAPERLANE_INPUT_RETENTION_MS`
- `PAPERLANE_OUTPUT_RETENTION_MS`
- `PAPERLANE_RATE_LIMIT_WINDOW_MS`
- `PAPERLANE_RATE_LIMIT_MAX_JOBS`
- `PAPERLANE_RATE_LIMIT_MAX_UPLOADS`
- `PAPERLANE_WORKER_CONCURRENCY`
- `PAPERLANE_WORKER_POLL_MS`
- `PAPERLANE_GHOSTSCRIPT_BINARY`

## Health Checks

- API health: `GET /health`
- API readiness: `GET /ready`

Do not expose temporary storage, queue files or worker services publicly.
