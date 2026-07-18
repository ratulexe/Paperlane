import { PDFDocument } from "pdf-lib";
import { validatePdfFile } from "@/lib/pdf/file-validation";
import { PdfProcessingError } from "@/lib/pdf/pdf-errors";
import { readFileBytes } from "@/lib/pdf/read-file-bytes";

export function getKeptPageIndexes(pageCount: number, pageIndexesToRemove: number[]) {
  if (pageCount < 1) throw new PdfProcessingError("This PDF does not contain any pages.", "EMPTY_FILE");

  const removeSet = new Set(pageIndexesToRemove);
  for (const pageIndex of removeSet) {
    if (pageIndex < 0 || pageIndex >= pageCount) {
      throw new PdfProcessingError(`This PDF has ${pageCount} pages. Choose pages within that range.`, "INVALID_PAGE_RANGE");
    }
  }

  const kept = Array.from({ length: pageCount }, (_, index) => index).filter((index) => !removeSet.has(index));
  if (kept.length === pageCount) throw new PdfProcessingError("Select at least one reviewed blank page to remove.", "INVALID_PAGE_RANGE");
  if (!kept.length) throw new PdfProcessingError("At least one page must remain in the PDF.", "INVALID_PAGE_RANGE");
  return kept;
}

export async function removePdfPages(file: File, pageIndexesToRemove: number[]) {
  validatePdfFile(file);
  const source = await PDFDocument.load(await readFileBytes(file), { ignoreEncryption: false });
  const keptPageIndexes = getKeptPageIndexes(source.getPageCount(), pageIndexesToRemove);
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, keptPageIndexes);
  for (const page of pages) output.addPage(page);
  return output.save();
}
