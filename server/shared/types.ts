export type CompressionPreset = "high-quality" | "balanced" | "smallest-size";

export type CompressionRequest =
  | {
      mode: "preset";
      preset: CompressionPreset;
    }
  | {
      mode: "target-size";
      targetBytes: number;
    };

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
  | "INVALID_TARGET_SIZE"
  | "TARGET_TOO_SMALL"
  | "TARGET_TOO_LARGE"
  | "TARGET_NOT_SMALLER_THAN_ORIGINAL"
  | "TARGET_NOT_REACHED"
  | "OUTPUT_PAGE_COUNT_MISMATCH"
  | "INTERNAL_ERROR";

export type CompressionSubStage =
  | "preparing-search"
  | "generating-candidate"
  | "validating-candidate"
  | "comparing-result"
  | "selecting-best-output"
  | "finalising-output";

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
  targetBytes?: number;
  targetMet?: boolean;
  attemptsUsed?: number;
  qualityLabel?: string;
  smallestCandidateBytes?: number;
  selectedCandidateBytes?: number;
  targetDifferenceBytes?: number;
};

export type CloudJobRecord = {
  jobId: string;
  tokenHash: string;
  toolType: CloudToolType;
  compressionRequest: CompressionRequest;
  state: CloudJobState;
  subStage?: CompressionSubStage;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  inputExpiresAt: string;
  outputExpiresAt?: string;
  originalBytes?: number;
  outputBytes?: number;
  compression?: CompressionResult;
  targetMet?: boolean;
  attemptsUsed?: number;
  maximumAttempts?: number;
  smallestCandidateBytes?: number;
  selectedCandidateBytes?: number;
  candidateQualityLevel?: string;
  candidateDpi?: number;
  targetDifferenceBytes?: number;
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
  compression: CompressionRequest;
} | CompressionRequest;

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
