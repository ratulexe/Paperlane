# Compress PDF Workflow

Compress PDF is designed as Paperlane's first temporary cloud-processing tool.

## User Flow

1. User opens `/compress-pdf`.
2. The page explains that compression requires temporary cloud processing.
3. User selects one `.pdf` file up to the configured maximum size.
4. User chooses High quality, Balanced or Smallest size.
5. User checks the explicit upload consent checkbox.
6. Frontend creates a compression job.
7. Frontend uploads the PDF with the client-held job token.
8. Frontend starts the queued job.
9. Frontend polls real job states: Uploading, Queued, Compressing, Checking output, Ready, Failed, Cancelled or Expired.
10. User downloads the protected output or deletes it immediately.

The UI does not show fake numeric progress.

## Presets

- High quality maps to Ghostscript `/prepress`.
- Balanced maps to Ghostscript `/ebook`.
- Smallest size maps to Ghostscript `/screen`.

Users cannot submit arbitrary Ghostscript flags.
