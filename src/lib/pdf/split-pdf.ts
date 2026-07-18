import { PDFDocument } from "pdf-lib";
import { validatePdfFile } from "@/lib/pdf/file-validation";
import { PdfProcessingError } from "@/lib/pdf/pdf-errors";
import { readFileBytes } from "@/lib/pdf/read-file-bytes";

export async function getPdfPageCount(file: File) {
  validatePdfFile(file);
  const pdf = await PDFDocument.load(await readFileBytes(file), { ignoreEncryption: false });
  const pageCount = pdf.getPageCount();
  if (pageCount < 1) throw new PdfProcessingError("This PDF does not contain any pages.", "EMPTY_FILE");
  return pageCount;
}

export async function extractPdfPages(file: File, pageIndexes: number[]) {
  validatePdfFile(file);
  const source = await PDFDocument.load(await readFileBytes(file), { ignoreEncryption: false });
  if (!pageIndexes.length) throw new PdfProcessingError("Choose at least one page.", "INVALID_PAGE_RANGE");
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, pageIndexes);
  for (const page of pages) output.addPage(page);
  return output.save();
}

export async function splitPdfEveryPage(file: File) {
  validatePdfFile(file);
  const source = await PDFDocument.load(await readFileBytes(file), { ignoreEncryption: false });
  const pageCount = source.getPageCount();
  if (pageCount < 1) throw new PdfProcessingError("This PDF does not contain any pages.", "EMPTY_FILE");
  const outputs: Uint8Array[] = [];

  for (let index = 0; index < pageCount; index += 1) {
    const output = await PDFDocument.create();
    const [page] = await output.copyPages(source, [index]);
    output.addPage(page);
    outputs.push(await output.save());
  }

  return outputs;
}
