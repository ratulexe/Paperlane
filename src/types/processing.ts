export type ProcessingStatus = "idle" | "validating" | "reading" | "processing" | "preparing-output" | "complete" | "error";

export type GeneratedOutput = {
  filename: string;
  blob: Blob;
  objectUrl: string;
  mimeType: string;
  size: number;
};

export type PdfPageRangeMode = "all" | "range";

export type SplitMode = "extract" | "every-page";

export type RotationOption = "90-clockwise" | "90-counter-clockwise" | "180";

export type ImagePdfPageSize = "fit" | "a4-portrait" | "a4-landscape";

export type ImagePdfMargin = "none" | "small" | "medium";

export type WatermarkPosition = "centre" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
