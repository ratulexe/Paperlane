# Railway Staging Deployment

Paperlane cloud compression can run on Railway as a first staging target with one combined container. The container starts both the API and worker processes and stores temporary job data on one mounted Railway volume.

This is a staging setup for the Compress PDF cloud workflow. It does not replace the existing local `docker-compose.yml` setup.

## Architecture

- One Railway service
- One Docker image built from `docker/railway-cloud.Dockerfile`
- One mounted Railway volume at `/data/paperlane-cloud`
- API process: `dist-server/server/api/index.js`
- Worker process: `dist-server/server/worker/index.js`
- Supervisor script: `server/railway/start-cloud-service.mjs`
- Ghostscript installed inside the runtime image

The API and worker share the same filesystem storage root, so queue files, job metadata, inputs and outputs are visible to both processes.

## Railway Project Setup

1. Create a new Railway project.
2. Add a service from the Paperlane GitHub repository.
3. Select the staging branch:

   ```text
   v0.4-cloud-processing-foundation
   ```

4. Set the Dockerfile path:

   ```text
   docker/railway-cloud.Dockerfile
   ```

5. Add one Railway volume and mount it at:

   ```text
   /data/paperlane-cloud
   ```

Railway provides `PORT` automatically. Paperlane reads `PORT` first and falls back to `PAPERLANE_API_PORT` only for local Docker.

## Environment Variables

Set these on the Railway service:

```text
PAPERLANE_STORAGE_ROOT=/data/paperlane-cloud
PAPERLANE_GHOSTSCRIPT_BINARY=gs
PAPERLANE_ALLOWED_ORIGINS=https://your-vercel-preview-or-domain.vercel.app
PAPERLANE_MAX_UPLOAD_BYTES=26214400
PAPERLANE_INPUT_RETENTION_MS=1800000
PAPERLANE_OUTPUT_RETENTION_MS=1800000
PAPERLANE_JOB_TIMEOUT_MS=120000
PAPERLANE_WORKER_CONCURRENCY=1
PAPERLANE_WORKER_POLL_MS=1500
PAPERLANE_PRODUCTION=false
```

Do not set `PAPERLANE_API_PORT` on Railway unless you are intentionally overriding local behavior. Railway injects `PORT`.

For local frontend development against Railway staging, include the local origin too:

```text
PAPERLANE_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://your-vercel-preview-or-domain.vercel.app
```

## Public Domain Setup

1. Deploy the Railway service.
2. Open the Railway service networking settings.
3. Generate a Railway public domain or attach a custom domain.
4. Confirm these endpoints respond:

   ```text
   https://your-railway-domain/health
   https://your-railway-domain/ready
   ```

## Vercel Frontend Environment Variable

Set the frontend cloud API base URL in Vercel:

```text
VITE_PAPERLANE_API_BASE_URL=https://your-railway-domain
```

Redeploy the Vercel preview or staging deployment after updating the environment variable.

## Testing Checklist

After Railway deploys:

- Visit `/health` and confirm `{ "ok": true }`.
- Visit `/ready` and confirm storage and queue are ready.
- Open the Vercel frontend staging deployment.
- Go to `/compress-pdf`.
- Select a small PDF.
- Confirm the temporary cloud-processing disclosure is visible.
- Upload and start a preset compression job.
- Confirm the status reaches Complete and the download button works.
- Test target-size mode with a realistic target.
- Start another job and click Delete now before processing begins.
- Confirm the UI shows Cancelled and no error category is displayed.
- Check Railway logs for both `paperlane-api` and `paperlane-worker` startup messages.
- Confirm `queue-processing` does not retain stale files after completed, failed, expired or cancelled jobs.

## Known Limitations

- This staging setup runs API and worker in one container. It is simple and matches the shared filesystem design, but it is not horizontally scalable.
- If the container restarts during processing, worker startup recovery requeues safe non-terminal processing receipts and removes terminal stale receipts.
- Railway volume storage is temporary workflow storage only. Paperlane does not provide document history.
- Files are temporarily uploaded for cloud compression. Browser-local tools remain separate and do not use this service.
- Target-size compression is best effort and may not reach very small targets.
- The service currently supports Compress PDF only. It does not add accounts, payments, AI APIs or permanent cloud storage.
