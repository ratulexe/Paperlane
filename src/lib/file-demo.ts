import type { AcceptedFileType, SelectedDemoFile } from "@/types/tool";

export const maxDemoFileSize = 25 * 1024 * 1024;

export function formatFileSize(bytes: number) {
  if (!bytes) return "0 KB";
  const units = ["bytes", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** index;
  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function getFileExtension(fileName: string) {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

export function acceptedTypeSummary(types: AcceptedFileType[]) {
  return types.flatMap((type) => type.extensions).join(", ");
}

export function validateDemoFile(file: File, acceptedFileTypes: AcceptedFileType[]) {
  if (file.size > maxDemoFileSize) {
    return "Choose a file smaller than 25 MB for this demonstration.";
  }

  const extension = `.${getFileExtension(file.name)}`;
  const matches = acceptedFileTypes.some((type) => {
    const extensionMatch = type.extensions.some((accepted) => accepted.toLowerCase() === extension);
    const mimeMatch = file.type ? type.mimeTypes.includes(file.type) : false;
    return extensionMatch || mimeMatch;
  });

  if (!matches) {
    return "This file type is not included in the selected demonstration workflow.";
  }

  return "";
}

export function createDemoFile(file: File): SelectedDemoFile {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    file,
  };
}
