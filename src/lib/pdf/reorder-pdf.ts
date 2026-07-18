import { PDFDocument } from "pdf-lib";
import { validatePdfFile } from "@/lib/pdf/file-validation";
import { readFileBytes } from "@/lib/pdf/read-file-bytes";
import { validatePageOrder } from "@/lib/pdf/reorder-utils";

export async function reorderPdfPages(file: File, pageIndexes: number[]) {
  validatePdfFile(file);
  const source = await PDFDocument.load(await readFileBytes(file), { ignoreEncryption: false });
  const pageCount = source.getPageCount();
  validatePageOrder(pageIndexes, pageCount);

  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, pageIndexes);
  for (const page of pages) output.addPage(page);
  return output.save();
}
