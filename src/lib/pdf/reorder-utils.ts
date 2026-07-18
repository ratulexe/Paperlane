import { PdfProcessingError } from "@/lib/pdf/pdf-errors";

export function createInitialPageOrder(pageCount: number) {
  if (pageCount < 1) return [];
  return Array.from({ length: pageCount }, (_, index) => index);
}

export function validatePageOrder(pageOrder: number[], pageCount: number) {
  if (pageCount < 1) throw new PdfProcessingError("This PDF does not contain any pages.", "EMPTY_FILE");
  if (pageOrder.length !== pageCount) throw new PdfProcessingError("The page order must include every page exactly once.", "PROCESSING_FAILED");
  if (new Set(pageOrder).size !== pageOrder.length) throw new PdfProcessingError("The page order contains duplicate pages.", "PROCESSING_FAILED");
  if (pageOrder.some((index) => index < 0 || index >= pageCount)) throw new PdfProcessingError("The page order contains a page outside this document.", "PROCESSING_FAILED");
}

export function movePageInOrder(pageOrder: number[], pageIndex: number, targetIndex: number) {
  const currentIndex = pageOrder.indexOf(pageIndex);
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= pageOrder.length) return pageOrder;

  const next = [...pageOrder];
  next.splice(currentIndex, 1);
  next.splice(targetIndex, 0, pageIndex);
  return next;
}
