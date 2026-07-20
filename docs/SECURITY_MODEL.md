# Security Model

## Local Versus Cloud

Paperlane's nine browser-local tools read files in browser memory and do not upload them to a Paperlane server.

Compress PDF and Protect PDF use a separate temporary cloud-processing model because native Ghostscript operations must not run in frontend code.

## Controls

- Random public job IDs and separate high-entropy client-held job tokens.
- Token-gated status, cancellation, deletion and download.
- Upload validation by extension, MIME type, PDF header, size and readable PDF parsing.
- Fixed Ghostscript preset mapping and controlled target-size candidate settings.
- Process execution uses an argument array, not shell string interpolation.
- Worker uses a per-job temporary directory and removes rejected target-size candidates.
- Worker timeout and cancellation request checks are implemented.
- Output validation checks non-empty output, PDF signature and parseability.
- Rate limiting is implemented for job creation and upload.
- Temporary retention and cleanup are implemented in server code.

## Limitations

No external audit, certification, end-to-end encryption, zero-knowledge processing or guaranteed immediate deletion is claimed. Production deployment still requires infrastructure hardening, storage permissions review, monitoring and legal/security review.
