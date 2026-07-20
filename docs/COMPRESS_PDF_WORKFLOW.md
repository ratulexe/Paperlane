# Compress PDF Workflow

Compress PDF is designed as Paperlane's first temporary cloud-processing tool.

## User Flow

1. User opens `/compress-pdf`.
2. The page explains that compression requires temporary cloud processing.
3. User selects one `.pdf` file up to the configured maximum size.
4. User chooses either a recommended preset or a maximum target size.
5. User checks the explicit upload consent checkbox.
6. Frontend creates a compression job.
7. Frontend uploads the PDF with the client-held job token.
8. Frontend starts the queued job.
9. Frontend polls real job states: Uploading, Queued, Compressing, Checking output, Ready, Failed, Cancelled or Expired.
10. User downloads the protected output or deletes it immediately.

The UI does not show fake numeric progress.

## Preset Mode

- High quality maps to Ghostscript `/prepress`.
- Balanced maps to Ghostscript `/ebook`.
- Smallest size maps to Ghostscript `/screen`.

Users cannot submit arbitrary Ghostscript flags.

## Target Maximum Size Mode

Target-size mode accepts a numeric KB or MB goal within the configured limits. The target must be smaller than the selected original PDF.

The worker tries a bounded list of controlled Ghostscript settings. Each candidate output is validated as a readable PDF and checked against the original page count. Paperlane selects the largest valid candidate at or below the target when one exists. If no candidate reaches the target, Paperlane keeps the smallest valid output and reports that the target was not reached.

This is a best-effort compression workflow, not an exact-size promise. Very small targets, already-optimised PDFs, mostly text/vector PDFs, scanned PDFs and image-heavy PDFs may not reach the requested maximum size.
