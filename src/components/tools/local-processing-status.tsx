import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import type { ProcessingStatus } from "@/types/processing";

const statusLabels: Record<ProcessingStatus, string> = {
  idle: "Ready",
  validating: "Validating file",
  reading: "Reading file",
  processing: "Processing locally",
  "preparing-output": "Preparing download",
  complete: "Complete",
  error: "Error",
};

const progressValues: Record<ProcessingStatus, number> = {
  idle: 0,
  validating: 15,
  reading: 30,
  processing: 68,
  "preparing-output": 92,
  complete: 100,
  error: 100,
};

export function LocalProcessingStatus({ status, error }: { status: ProcessingStatus; error?: string }) {
  const isActive = status === "validating" || status === "reading" || status === "processing" || status === "preparing-output";
  const isComplete = status === "complete";
  const isError = status === "error";

  return (
    <div className="space-y-3" aria-live="polite">
      <div className="flex items-center gap-2 text-sm font-semibold">
        {isActive ? <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" /> : null}
        {isComplete ? <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" /> : null}
        {isError ? <XCircle className="h-4 w-4 text-destructive" aria-hidden="true" /> : null}
        <span>{statusLabels[status]}</span>
      </div>
      <Progress value={progressValues[status]} aria-label={`Local processing status: ${statusLabels[status]}`} />
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
