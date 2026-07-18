export type CompressionPreset = "high-quality" | "balanced" | "smallest-size";

export type CloudToolType = "compress-pdf";

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

export type DeletionState = {
  inputDeleted: boolean;
  outputDeleted: boolean;
  localFilesDeleted: boolean;
};

export type CompressionResult = {
  originalBytes: number;
  outputBytes: number;
  savedBytes: number;
  savedPercent: number;
  outputLarger: boolean;
};

export type CloudJobRecord = {
  jobId: string;
  tokenHash: string;
  toolType: CloudToolType;
  preset: CompressionPreset;
  state: CloudJobState;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  inputExpiresAt: string;
  outputExpiresAt?: string;
  originalBytes?: number;
  outputBytes?: number;
  compression?: CompressionResult;
  inputKey?: string;
  outputKey?: string;
  safeOutputFilename?: string;
  originalFilename?: string;
  errorCategory?: PublicErrorCategory;
  attemptCount: number;
  cancellationRequested: boolean;
  deletion: DeletionState;
};

export type PublicCloudJob = Omit<CloudJobRecord, "tokenHash" | "inputKey" | "outputKey"> & {
  canDownload: boolean;
};

export type CreateCompressionJobRequest = {
  preset: CompressionPreset;
};

export type CreateCompressionJobResponse = {
  job: PublicCloudJob;
  jobToken: string;
};

export type ApiErrorResponse = {
  error: {
    category: PublicErrorCategory;
    message: string;
    requestId: string;
  };
};
