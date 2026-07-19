# Paperlane Known Limitations

- Browser-local processing can fail on very large or complex files because it depends on available device memory.
- Password-protected or encrypted PDFs are not supported.
- Corrupted or malformed PDFs and images may be rejected.
- The watermark tool uses a standard embedded PDF font; complex Unicode text may not render as expected.
- Visual Sign PDF creates a visual electronic signature only. Paperlane does not create cryptographic, certified or legally verified digital signatures.
- Blank-page detection is heuristic and always requires user review before removal.
- PDF to JPG/PNG creates individual image downloads and can bundle multiple generated images into a ZIP.
- Compress PDF target maximum size is best effort. Paperlane may return the smallest valid output when the requested target cannot be reached.
- Compress PDF uses temporary cloud processing and depends on the configured API and worker being available.
- Paperlane does not provide account-based cloud storage, recovery, document history or server-side file repair.
- Browser download behavior can vary, especially on mobile browsers and Safari.
- Browser-local processing reduces server exposure but does not guarantee complete security on shared, public, untrusted or compromised devices.
