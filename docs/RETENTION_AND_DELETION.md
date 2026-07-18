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

Operational metadata may include random job ID, job state, timestamps, file size, compression preset, processing duration, public error category and deletion state. File contents and job tokens must not be logged.
