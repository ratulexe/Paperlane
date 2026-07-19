# Paperlane Cloud Processing Architecture

Phase 9 introduces a separate cloud-processing foundation for Compress PDF without moving the existing Vite frontend into a backend app. Phase 9.5 adds target maximum size compression on top of the same API and worker boundary.

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

For target-size jobs, the worker creates several candidate PDFs in the per-job temporary directory. Rejected and non-selected candidates are removed, and only the selected final output is copied into temporary output storage.

## Current Gate

Docker and Ghostscript end-to-end compression have been verified locally for preset and target-size jobs. Compress PDF remains a gated cloud foundation rather than a production-ready catalogue tool until retention timing, deployment configuration, monitoring and environment-specific security checks are completed.
