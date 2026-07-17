import type { GeneratedOutput } from "@/types/processing";

export function sanitizeFilename(filename: string) {
  const cleaned = Array.from(filename)
    .map((character) => (character.charCodeAt(0) < 32 || '<>:"/\\|?*'.includes(character) ? "-" : character))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "paperlane-output.pdf";
}

export function createGeneratedOutput(bytes: Uint8Array, filename: string, mimeType = "application/pdf"): GeneratedOutput {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const blob = new Blob([buffer], { type: mimeType });
  return {
    filename: sanitizeFilename(filename),
    blob,
    objectUrl: URL.createObjectURL(blob),
    mimeType,
    size: blob.size,
  };
}

export function revokeGeneratedOutputs(outputs: GeneratedOutput[]) {
  for (const output of outputs) {
    URL.revokeObjectURL(output.objectUrl);
  }
}

export function downloadGeneratedOutput(output: GeneratedOutput) {
  const anchor = document.createElement("a");
  anchor.href = output.objectUrl;
  anchor.download = sanitizeFilename(output.filename);
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}
