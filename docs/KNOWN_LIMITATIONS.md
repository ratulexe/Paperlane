# Paperlane Known Limitations

- Browser-local processing can fail on very large or complex files because it depends on available device memory.
- Password-protected or encrypted PDFs are not supported.
- Corrupted or malformed PDFs and images may be rejected.
- The watermark tool uses a standard embedded PDF font; complex Unicode text may not render as expected.
- Visual Sign PDF creates a visual electronic signature only. Paperlane does not create cryptographic, certified or legally verified digital signatures.
- Blank-page detection is heuristic and always requires user review before removal.
- PDF to JPG/PNG creates individual image downloads; ZIP bundling is not included in this phase.
- Paperlane does not provide cloud storage, recovery, account history or server-side file repair.
- Browser download behavior can vary, especially on mobile browsers and Safari.
- Browser-local processing reduces server exposure but does not guarantee complete security on shared, public, untrusted or compromised devices.
