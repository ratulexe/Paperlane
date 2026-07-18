export type CompressionPreset = "high-quality" | "balanced" | "smallest-size";

export type CloudJobState =
  | "created"
  | "awaiting-upload"
  | "queued"
  | "validating"
  | "processing"
  | "validating-output"
  | "complete"
  | "failed"
  | "expired"
  | "cancelled";

export type PublicErrorCategory =
  | "INVALID_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "EMPTY_FILE"
  | "INVALID_PDF"
  | "ENCRYPTED_PDF"
  | "UPLOAD_FAILED"
  | "JOB_NOT_FOUND"
  | "JOB_EXPIRED"
  | "JOB_ALREADY_STARTED"
  | "RATE_LIMITED"
  | "QUEUE_UNAVAILABLE"
  | "PROCESSING_TIMEOUT"
  | "COMPRESSION_FAILED"
  | "OUTPUT_INVALID"
  | "STORAGE_FAILED"
  | "DOWNLOAD_EXPIRED"
  | "UNAUTHORISED_JOB"
  | "INVALID_STATE"
  | "INTERNAL_ERROR";

export type PublicCloudJob = {
  jobId: string;
  toolType: "compress-pdf";
  preset: CompressionPreset;
  state: CloudJobState;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  inputExpiresAt: string;
  outputExpiresAt?: string;
  originalBytes?: number;
  outputBytes?: number;
  compression?: {
    originalBytes: number;
    outputBytes: number;
    savedBytes: number;
    savedPercent: number;
    outputLarger: boolean;
  };
  safeOutputFilename?: string;
  originalFilename?: string;
  errorCategory?: PublicErrorCategory;
  attemptCount: number;
  cancellationRequested: boolean;
  deletion: {
    inputDeleted: boolean;
    outputDeleted: boolean;
    localFilesDeleted: boolean;
  };
  canDownload: boolean;
};

export type CreateCompressionJobResponse = {
  job: PublicCloudJob;
  jobToken: string;
};
