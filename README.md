# Paperlane

## Overview

Paperlane is a polished document productivity website for a privacy-conscious workspace concept. It now includes selected browser-local PDF tools while still presenting the broader product as a clearly labelled concept.

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
- Add Watermark: `/add-watermark`
- Privacy
- Contact

## Main Features

- Responsive SaaS landing page
- Actual shadcn/ui components
- 19 document workflows
- 6 browser-local functional tools
- 13 clearly labelled concept previews
- Tool search and category filters
- Reusable workflow Dialog
- Local PDF processing for merge, split, rotate, reorder, image-to-PDF and text watermark tools
- Real Blob/object URL downloads for functional tools
- File metadata previews and simulated progress for concept tools
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

The following tools run in browser memory with `pdf-lib` and selected files are not uploaded to a Paperlane server:

- Merge PDF (`/merge-pdf`)
- Split PDF (`/split-pdf`)
- Rotate PDF (`/rotate-pdf`)
- Reorder Pages (`/reorder-pdf`)
- JPG/PNG to PDF (`/jpg-to-pdf`)
- Add Watermark (`/add-watermark`)

Supported limits:

- PDF tools: `.pdf`, maximum 50 MB per PDF
- Merge PDF: 2 to 5 PDFs
- JPG/PNG to PDF: `.jpg`, `.jpeg`, `.png`, maximum 20 MB per image, maximum 10 images
- Add Watermark: watermark text is limited to 100 characters

## Concept Previews

The remaining tools are labelled as concept previews and appear as roadmap items with disabled Coming soon actions. They do not process documents or create output files.

## Important Limitations

Paperlane is still a product concept, not a production document platform.

- No backend processing
- No file uploads to a Paperlane server
- No document storage or document history
- No real AI functionality
- No contact transmission
- No backend
- No authentication
- No database
- Browser-local processing can use significant device memory
- Local processing reduces server exposure but does not guarantee complete security on untrusted, shared or compromised devices

## Documentation

- [Local processing architecture](docs/LOCAL_PROCESSING_ARCHITECTURE.md)
- [Testing guide](docs/TESTING_GUIDE.md)
- [Known limitations](docs/KNOWN_LIMITATIONS.md)

## AI-Assisted Development

AI tools assisted with ideation, planning, component generation, code creation, debugging and refinement. The project was then manually reviewed, tested and adjusted for responsive behavior, accessibility, content accuracy and build readiness.

## Deployment

The application is prepared for deployment on Vercel. The included `vercel.json` supports React Router single-page application navigation for direct visits to internal routes.
