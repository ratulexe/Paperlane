import { PDFDocument } from "pdf-lib";
import { PdfProcessingError } from "@/lib/pdf/pdf-errors";

export async function mergePdfFiles(files: File[]) {
  if (files.length < 2) throw new PdfProcessingError("Choose at least two PDF files to merge.");
  if (files.length > 5) throw new PdfProcessingError("Merge PDF supports up to five files at a time.");

  const merged = await PDFDocument.create();

  for (const file of files) {
    const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false });
    const pageCount = source.getPageCount();
    if (pageCount < 1) throw new PdfProcessingError(`${file.name} does not contain any pages.`);
    const pages = await merged.copyPages(source, source.getPageIndices());
    for (const page of pages) merged.addPage(page);
  }

  return merged.save();
}
