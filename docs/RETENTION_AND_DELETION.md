# Retention and Deletion

Phase 9 uses temporary storage only.

## Defaults

- Unprocessed input expiry: 30 minutes.
- Failed job expiry: 30 minutes.
- Completed input deletion: immediately after worker processing succeeds.
- Completed output expiry: 30 minutes after completion.

These are configurable implementation defaults, not broad privacy guarantees.

## Cleanup

The API starts a periodic cleanup pass that selects expired jobs and expired outputs. Cleanup is idempotent and can be safely attempted more than once.

The frontend Delete now action is a convenience. Server-side expiration and cleanup remain authoritative.

## Metadata

Operational metadata may include random job ID, job state, timestamps, file size, compression mode, compression preset or target size, candidate attempt counts, selected candidate size, processing duration, public error category and deletion state. File contents and job tokens must not be logged.

For target-size compression, intermediate candidate files are stored only in the worker's per-job temporary directory and are removed before the job finishes. The API stores only the selected final output until deletion or expiration.
