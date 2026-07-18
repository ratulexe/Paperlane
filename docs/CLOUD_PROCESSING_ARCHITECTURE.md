# Paperlane Cloud Processing Architecture

Phase 9 introduces a separate cloud-processing foundation for Compress PDF without moving the existing Vite frontend into a backend app.

## Selected Structure

- `src/`: static Vite React frontend.
- `server/api/`: Node.js TypeScript HTTP API.
- `server/worker/`: Node.js TypeScript worker orchestration for Ghostscript.
- `server/shared/`: typed job model, config, validation, storage, queue, cleanup and rate-limit utilities.
- `docker/`: API and worker Dockerfiles.
- `docker-compose.yml`: local API and worker setup with a shared temporary storage volume.

The frontend never executes shell commands or native binaries. Ghostscript is only invoked by the worker container through `child_process.spawn()` with a fixed argument array.

## Processing Boundary

Browser -> API creates a token-gated temporary job -> browser uploads one PDF -> API queues the job -> worker compresses the PDF in an isolated temporary directory -> worker validates the output -> API streams a temporary protected download -> cleanup expires/deletes input and output files.

## Current Gate

This workstation does not have Docker or Ghostscript available, so end-to-end worker output could not be verified here. Compress PDF remains a gated cloud foundation rather than a production-ready tool until the Docker workflow is run and the output PDF is manually opened.
