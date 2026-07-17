import { PDFDocument } from "pdf-lib";
import { PdfProcessingError } from "@/lib/pdf/pdf-errors";

export async function reorderPdfPages(file: File, pageIndexes: number[]) {
  const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false });
  const pageCount = source.getPageCount();
  if (pageCount < 1) throw new PdfProcessingError("This PDF does not contain any pages.");
  if (pageIndexes.length !== pageCount) throw new PdfProcessingError("The page order must include every page exactly once.");
  if (new Set(pageIndexes).size !== pageIndexes.length) throw new PdfProcessingError("The page order contains duplicate pages.");

  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, pageIndexes);
  for (const page of pages) output.addPage(page);
  return output.save();
}
