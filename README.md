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

## Functional Tools

The following tools run in browser memory with `pdf-lib` and selected files are not uploaded to a Paperlane server:

- Merge PDF
- Split PDF
- Rotate PDF
- Reorder Pages
- JPG/PNG to PDF
- Add Watermark

## Concept Previews

The remaining tools are interface previews only. They may accept a file selection to show metadata and workflow states, but they do not process documents or create output files.

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

## AI-Assisted Development

AI tools assisted with ideation, planning, component generation, code creation, debugging and refinement. The project was then manually reviewed, tested and adjusted for responsive behavior, accessibility, content accuracy and build readiness.

## Deployment

The application is prepared for deployment on Vercel. The included `vercel.json` supports React Router single-page application navigation for direct visits to internal routes.
