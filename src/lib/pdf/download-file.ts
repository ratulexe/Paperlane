import type { GeneratedOutput } from "@/types/processing";

type ZipEntry = {
  filename: string;
  blob: Blob;
};

const crcTable = new Uint32Array(256).map((_, tableIndex) => {
  let value = tableIndex;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

export function sanitizeFilename(filename: string) {
  const cleaned = Array.from(filename)
    .map((character) => (character.charCodeAt(0) < 32 || '<>:"/\\|?*'.includes(character) ? "-" : character))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "paperlane-output.pdf";
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosDate, dosTime };
}

function writeUint16(target: Uint8Array, offset: number, value: number) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
}

function writeUint32(target: Uint8Array, offset: number, value: number) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
  target[offset + 2] = (value >>> 16) & 0xff;
  target[offset + 3] = (value >>> 24) & 0xff;
}

function concatBytes(chunks: Uint8Array[]) {
  const totalLength = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}

function uniqueFilenames(entries: ZipEntry[]) {
  const seen = new Map<string, number>();

  return entries.map((entry) => {
    const sanitized = sanitizeFilename(entry.filename);
    const currentCount = seen.get(sanitized.toLowerCase()) ?? 0;
    seen.set(sanitized.toLowerCase(), currentCount + 1);

    if (currentCount === 0) return { ...entry, filename: sanitized };

    const extensionIndex = sanitized.lastIndexOf(".");
    const base = extensionIndex > 0 ? sanitized.slice(0, extensionIndex) : sanitized;
    const extension = extensionIndex > 0 ? sanitized.slice(extensionIndex) : "";
    return { ...entry, filename: `${base}-${currentCount + 1}${extension}` };
  });
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

export async function createZipBlob(entries: ZipEntry[]) {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const centralDirectory: Uint8Array[] = [];
  let offset = 0;
  const { dosDate, dosTime } = dosDateTime();
  const zippedEntries = uniqueFilenames(entries);

  for (const entry of zippedEntries) {
    const filenameBytes = encoder.encode(entry.filename);
    const data = new Uint8Array(await entry.blob.arrayBuffer());
    const checksum = crc32(data);
    const localHeader = new Uint8Array(30 + filenameBytes.byteLength);

    writeUint32(localHeader, 0, 0x04034b50);
    writeUint16(localHeader, 4, 20);
    writeUint16(localHeader, 6, 0);
    writeUint16(localHeader, 8, 0);
    writeUint16(localHeader, 10, dosTime);
    writeUint16(localHeader, 12, dosDate);
    writeUint32(localHeader, 14, checksum);
    writeUint32(localHeader, 18, data.byteLength);
    writeUint32(localHeader, 22, data.byteLength);
    writeUint16(localHeader, 26, filenameBytes.byteLength);
    writeUint16(localHeader, 28, 0);
    localHeader.set(filenameBytes, 30);
    chunks.push(localHeader, data);

    const directoryHeader = new Uint8Array(46 + filenameBytes.byteLength);
    writeUint32(directoryHeader, 0, 0x02014b50);
    writeUint16(directoryHeader, 4, 20);
    writeUint16(directoryHeader, 6, 20);
    writeUint16(directoryHeader, 8, 0);
    writeUint16(directoryHeader, 10, 0);
    writeUint16(directoryHeader, 12, dosTime);
    writeUint16(directoryHeader, 14, dosDate);
    writeUint32(directoryHeader, 16, checksum);
    writeUint32(directoryHeader, 20, data.byteLength);
    writeUint32(directoryHeader, 24, data.byteLength);
    writeUint16(directoryHeader, 28, filenameBytes.byteLength);
    writeUint16(directoryHeader, 30, 0);
    writeUint16(directoryHeader, 32, 0);
    writeUint16(directoryHeader, 34, 0);
    writeUint16(directoryHeader, 36, 0);
    writeUint32(directoryHeader, 38, 0);
    writeUint32(directoryHeader, 42, offset);
    directoryHeader.set(filenameBytes, 46);
    centralDirectory.push(directoryHeader);

    offset += localHeader.byteLength + data.byteLength;
  }

  const centralDirectoryOffset = offset;
  const centralDirectoryBytes = concatBytes(centralDirectory);
  const endRecord = new Uint8Array(22);
  writeUint32(endRecord, 0, 0x06054b50);
  writeUint16(endRecord, 4, 0);
  writeUint16(endRecord, 6, 0);
  writeUint16(endRecord, 8, zippedEntries.length);
  writeUint16(endRecord, 10, zippedEntries.length);
  writeUint32(endRecord, 12, centralDirectoryBytes.byteLength);
  writeUint32(endRecord, 16, centralDirectoryOffset);
  writeUint16(endRecord, 20, 0);

  const zipBytes = concatBytes([...chunks, centralDirectoryBytes, endRecord]);
  const buffer = new ArrayBuffer(zipBytes.byteLength);
  new Uint8Array(buffer).set(zipBytes);
  return new Blob([buffer], { type: "application/zip" });
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

export function downloadBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = sanitizeFilename(filename);
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}
