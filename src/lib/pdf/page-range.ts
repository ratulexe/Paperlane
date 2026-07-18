import { PdfProcessingError } from "@/lib/pdf/pdf-errors";

export function parsePageRange(input: string, pageCount: number): number[] {
  const trimmed = input.trim();
  if (!trimmed) throw new PdfProcessingError("Enter a page range before processing.", "INVALID_PAGE_RANGE");
  if (pageCount < 1) throw new PdfProcessingError("This PDF does not contain any pages.", "EMPTY_FILE");

  const pages: number[] = [];
  const seen = new Set<number>();

  for (const part of trimmed.split(",")) {
    const segment = part.trim();
    if (!segment) throw new PdfProcessingError("Use a valid page range such as 1-3 or 1,3,5.", "INVALID_PAGE_RANGE");

    const rangeMatch = segment.match(/^(\d+)\s*-\s*(\d+)$/);
    const singleMatch = segment.match(/^\d+$/);

    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      if (start < 1 || end < 1) throw new PdfProcessingError("Page numbers must start at 1.", "INVALID_PAGE_RANGE");
      if (end < start) throw new PdfProcessingError("Page ranges must go from lower to higher page numbers.", "INVALID_PAGE_RANGE");
      if (end > pageCount) throw new PdfProcessingError(`This PDF has ${pageCount} pages. Choose pages within that range.`, "INVALID_PAGE_RANGE");
      for (let page = start; page <= end; page += 1) {
        const zeroBased = page - 1;
        if (!seen.has(zeroBased)) {
          seen.add(zeroBased);
          pages.push(zeroBased);
        }
      }
      continue;
    }

    if (singleMatch) {
      const page = Number(segment);
      if (page < 1) throw new PdfProcessingError("Page numbers must start at 1.", "INVALID_PAGE_RANGE");
      if (page > pageCount) throw new PdfProcessingError(`This PDF has ${pageCount} pages. Choose pages within that range.`, "INVALID_PAGE_RANGE");
      const zeroBased = page - 1;
      if (!seen.has(zeroBased)) {
        seen.add(zeroBased);
        pages.push(zeroBased);
      }
      continue;
    }

    throw new PdfProcessingError("Use a valid page range such as 1-3 or 1,3,5.", "INVALID_PAGE_RANGE");
  }

  if (!pages.length) throw new PdfProcessingError("Choose at least one page.", "INVALID_PAGE_RANGE");
  return pages;
}
