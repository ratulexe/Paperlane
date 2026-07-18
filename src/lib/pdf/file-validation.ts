import { PdfProcessingError } from "@/lib/pdf/pdf-errors";

export const PDF_MAX_BYTES = 50 * 1024 * 1024;
export const IMAGE_MAX_BYTES = 20 * 1024 * 1024;
export const MAX_IMAGE_FILES = 10;
export const MIN_MERGE_FILES = 2;
export const MAX_MERGE_FILES = 5;

const pdfMimeTypes = ["application/pdf"];
const imageMimeTypes = ["image/jpeg", "image/png"];

export function getLowercaseExtension(fileName: string) {
  return fileName.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? "";
}

export function isPdfFileLike(file: File) {
  return pdfMimeTypes.includes(file.type) || getLowercaseExtension(file.name) === ".pdf";
}

export function isImageFileLike(file: File) {
  const extension = getLowercaseExtension(file.name);
  return imageMimeTypes.includes(file.type) || extension === ".jpg" || extension === ".jpeg" || extension === ".png";
}

export function validatePdfFile(file: File) {
  if (!isPdfFileLike(file)) throw new PdfProcessingError("Choose a valid PDF file.", "INVALID_FILE_TYPE");
  if (file.size === 0) throw new PdfProcessingError("This file is empty. Choose a PDF with content.", "EMPTY_FILE");
  if (file.size > PDF_MAX_BYTES) throw new PdfProcessingError("Choose a PDF smaller than 50 MB.", "FILE_TOO_LARGE");
}

export function validateImageFile(file: File) {
  if (!isImageFileLike(file)) throw new PdfProcessingError("Choose a JPG or PNG image.", "INVALID_FILE_TYPE");
  if (file.size === 0) throw new PdfProcessingError("This image is empty. Choose a JPG or PNG with content.", "EMPTY_FILE");
  if (file.size > IMAGE_MAX_BYTES) throw new PdfProcessingError("Choose images smaller than 20 MB each.", "FILE_TOO_LARGE");
}

export function validateMergeFiles(files: File[]) {
  if (files.length < MIN_MERGE_FILES) throw new PdfProcessingError("Choose at least two PDF files to merge.", "TOO_FEW_FILES");
  if (files.length > MAX_MERGE_FILES) throw new PdfProcessingError("Merge PDF supports up to five files at a time.", "TOO_MANY_FILES");
  files.forEach(validatePdfFile);
}

export function validateImageFiles(files: File[]) {
  if (!files.length) throw new PdfProcessingError("Select at least one JPG or PNG image before converting.", "TOO_FEW_FILES");
  if (files.length > MAX_IMAGE_FILES) throw new PdfProcessingError("Image to PDF supports up to 10 images.", "TOO_MANY_FILES");
  files.forEach(validateImageFile);
}
