# Paperlane

## Overview

Paperlane is a polished document productivity website for a privacy-conscious workspace concept. It includes selected browser-local PDF tools and an available temporary cloud-processing workflow for Compress PDF, including preset compression and target maximum size attempts.

## Tagline

A smoother way to work with documents.

## Project Category

Privacy-conscious document productivity SaaS concept with selected browser-local tools.

## Pages

- Home
- About
- Tools
- Merge PDF: `/merge-pdf`
- Split PDF: `/split-pdf`
- Rotate PDF: `/rotate-pdf`
- Reorder PDF: `/reorder-pdf`
- JPG/PNG to PDF: `/jpg-to-pdf`
- PDF to JPG/PNG: `/pdf-to-jpg`
- Remove Blank Pages: `/remove-blank-pages`
- Add Watermark: `/add-watermark`
- Visual Sign PDF: `/visual-sign-pdf`
- Compress PDF cloud foundation: `/compress-pdf`
- Privacy
- Contact

## Main Features

- Responsive SaaS landing page
- Actual shadcn/ui components
- 19 document workflows
- 9 browser-local functional tools
- 1 temporary cloud-processing Compress PDF tool
- 9 clearly labelled coming-soon tools
- Compress PDF API and worker foundation for temporary cloud processing with preset and target-size modes
- Tool search and category filters
- Reusable workflow Dialog
- Local PDF processing for merge, split, rotate, reorder, image-to-PDF, PDF-to-image, blank-page review/removal, text watermark and visual-signature tools
- Real Blob/object URL downloads for functional tools
- File metadata previews and disabled roadmap cards for concept tools
- Responsible AI notices
- Privacy-design explanation
- Accessible contact-form demonstration
- Responsive mobile navigation
- Route-specific metadata

## Technology Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- Lucide React
- React Hook Form
- Zod
- pdf-lib

## Typography

- Style Script for the Paperlane wordmark
- Manrope for all other text

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Testing

```bash
npm run lint
npm run test:run
npm run build
```

## Functional Tools

The following tools run in browser memory with `pdf-lib`, PDF.js and selected files are not uploaded to a Paperlane server:

- Merge PDF (`/merge-pdf`)
- Split PDF (`/split-pdf`)
- Rotate PDF (`/rotate-pdf`)
- Reorder Pages (`/reorder-pdf`)
- JPG/PNG to PDF (`/jpg-to-pdf`)
- PDF to JPG/PNG (`/pdf-to-jpg`)
- Remove Blank Pages (`/remove-blank-pages`)
- Add Watermark (`/add-watermark`)
- Visual Sign PDF (`/visual-sign-pdf`)

Supported limits:

- PDF tools: `.pdf`, maximum 50 MB per PDF
- Merge PDF: 2 to 5 PDFs
- JPG/PNG to PDF: `.jpg`, `.jpeg`, `.png`, maximum 20 MB per image, maximum 10 images
- PDF to JPG/PNG: exports selected pages as individual image downloads
- Remove Blank Pages: suggestions require user review before pages are removed
- Add Watermark: watermark text is limited to 100 characters
- Visual Sign PDF: creates a visual electronic signature only, not a cryptographic digital signature

## Temporary Cloud Processing Foundation

Compress PDF has a dedicated route, API, worker and Docker setup for temporary cloud processing. It creates token-gated jobs, validates uploads, queues work, runs Ghostscript in the worker, validates output, calculates real byte-size results and supports deletion/expiration.

Preset mode offers high quality, balanced and smallest-size options. Target-size mode lets the user enter a maximum size goal; the worker tries several controlled Ghostscript settings, selects the largest valid output at or below the target when possible, and otherwise returns the smallest valid output with a clear target-not-reached result.

The Compress PDF catalogue card is available as a temporary cloud-processing tool when the API and worker service are running.

## Railway Staging

Paperlane includes a Railway staging option for the Compress PDF cloud service. Railway does not run `docker-compose.yml` directly, so staging uses one combined container that starts both the API and worker while sharing one mounted Railway volume at `/data/paperlane-cloud`.

Use `docker/railway-cloud.Dockerfile` as the Railway Dockerfile path and set `VITE_PAPERLANE_API_BASE_URL` in the Vercel frontend to the Railway public domain. See [Railway staging deployment](docs/RAILWAY_STAGING_DEPLOYMENT.md) for setup steps, environment variables and the testing checklist.

## Concept Previews

The remaining 9 tools are labelled as concept previews and appear as roadmap items with disabled Coming soon actions. They do not process documents or create output files.

## Important Limitations

Paperlane is still a product concept, not a production document platform.

- Compress PDF is not marked production-functional until Docker/Ghostscript, retention, deletion and deployment checks are completed for the target environment
- Browser-local tools do not upload files to a Paperlane server
- Compress PDF requires a separate temporary cloud-processing API and worker when enabled
- No document storage or document history
- No real AI functionality
- No contact transmission
- No authentication or database-backed account system
- No authentication
- No database
- Browser-local processing can use significant device memory
- Target-size compression is a best-effort maximum-size workflow, not an exact-size guarantee
- Local processing reduces server exposure but does not guarantee complete security on untrusted, shared or compromised devices

## Documentation

- [Local processing architecture](docs/LOCAL_PROCESSING_ARCHITECTURE.md)
- [Cloud processing architecture](docs/CLOUD_PROCESSING_ARCHITECTURE.md)
- [Compress PDF workflow](docs/COMPRESS_PDF_WORKFLOW.md)
- [Retention and deletion](docs/RETENTION_AND_DELETION.md)
- [Local cloud development](docs/LOCAL_CLOUD_DEVELOPMENT.md)
- [Railway staging deployment](docs/RAILWAY_STAGING_DEPLOYMENT.md)
- [Security model](docs/SECURITY_MODEL.md)
- [Deployment guide](docs/DEPLOYMENT_GUIDE.md)
- [Testing guide](docs/TESTING_GUIDE.md)
- [Known limitations](docs/KNOWN_LIMITATIONS.md)

## AI-Assisted Development

AI tools assisted with ideation, planning, component generation, code creation, debugging and refinement. The project was then manually reviewed, tested and adjusted for responsive behavior, accessibility, content accuracy and build readiness.

## Deployment

The application is prepared for deployment on Vercel. The included `vercel.json` supports React Router single-page application navigation for direct visits to internal routes.
