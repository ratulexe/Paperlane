# Paperlane Testing Guide

## Automated Commands

```bash
npm run lint
npm run test:run
npm run build
```

The automated test suite focuses on deterministic utilities:

- Page-range parsing
- File validation
- Filename sanitisation
- Rotation normalisation
- Page reorder utilities
- Watermark position calculation
- Blank-page detection and removal utility logic
- Visual signature utility behavior
- File display helpers

## Manual Tool Checks

Use harmless generated files only.

- Merge PDF: test two PDFs, five PDFs, file removal, reordering, and output page count.
- Split PDF: test selected ranges, duplicate page input, invalid ranges, and split-every-page outputs.
- Rotate PDF: test each rotation option on all pages and selected page ranges.
- Reorder PDF: test first-to-last, last-to-first, repeated moves and reset.
- JPG/PNG to PDF: test JPG, PNG, mixed files, ordering, margins and page size modes.
- PDF to JPG/PNG: test JPG output, PNG output, selected page ranges and individual downloads.
- Remove Blank Pages: test suggested blank pages, manual checkbox changes, no-selection rejection and all-pages rejection.
- Add Watermark: test each position, selected pages, opacity, font-size limits and empty text rejection.
- Visual Sign PDF: test drawn, typed and uploaded signature flows, page choice, placement and size.

## Network Verification

During manual processing, confirm no document upload or generated-output upload requests occur. Normal HTML, CSS, JavaScript, font and PDF worker requests are acceptable.

## Browser Testing

Verify Chrome, Edge and Firefox manually. Safari compatibility should be reviewed for `File.arrayBuffer()`, `Blob`, object URLs, download anchors and PDF.js worker loading.
