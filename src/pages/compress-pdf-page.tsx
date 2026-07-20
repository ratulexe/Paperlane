import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, Download, FilePlus2, Trash2, UploadCloud } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getToolById } from "@/data/tool-pages";
import { tools } from "@/data/tools";
import { getFunctionalToolRoute, getToolStatusLabel } from "@/lib/tool-routes";
import {
  checkCloudReadiness,
  createCompressionJob,
  deleteCompressionJob,
  downloadCompressionOutput,
  getCompressionJob,
  startCompressionJob,
  uploadCompressionInput,
} from "@/lib/cloud/compression-api";
import { recommendTargetSize, targetBytesFromInput, validateTargetSize, type TargetSizeUnit } from "@/lib/cloud/target-size";
import { formatFileSize } from "@/lib/file-demo";
import { usePageMetadata } from "@/lib/use-page-metadata";
import type { CompressionPreset, CompressionRequest, PublicCloudJob } from "@/types/cloud-processing";

const maxUploadBytes = 25 * 1024 * 1024;
const retentionCopy = "30 minutes for uploaded inputs that are not processed, and 30 minutes for completed outputs.";

function stageLabel(job?: PublicCloudJob, uploading = false) {
  if (uploading) return "Uploading";
  if (!job) return "Ready";
  if (job.state === "complete" && job.compression?.targetBytes && job.compression.targetMet === false) {
    return "Complete - target not reached";
  }
  if (job.subStage === "generating-candidate" && job.attemptsUsed && job.maximumAttempts) {
    return "Optimising toward selected file size";
  }
  if (job.subStage === "validating-candidate") return "Checking candidate output";
  if (job.subStage === "comparing-result") return "Comparing target-size result";
  if (job.subStage === "selecting-best-output") return "Selecting best output";
  if (job.subStage === "finalising-output") return "Finalising output";
  const labels: Record<PublicCloudJob["state"], string> = {
    created: "Validating",
    "awaiting-upload": "Ready",
    queued: "Queued",
    validating: "Validating",
    processing: "Compressing",
    "validating-output": "Checking output",
    complete: "Complete",
    failed: "Failed",
    expired: "Expired",
    cancelled: "Cancelled",
    deleted: "Deleted",
  };
  return labels[job.state];
}

function isActiveJob(job?: PublicCloudJob) {
  return Boolean(job && !["complete", "failed", "expired", "cancelled", "deleted"].includes(job.state));
}

function estimateTotalSeconds(fileBytes?: number, mode: CompressionRequest["mode"] = "preset") {
  const sizeMb = fileBytes ? fileBytes / (1024 * 1024) : 1;
  const baseSeconds = mode === "target-size" ? 35 + sizeMb * 10 : 20 + sizeMb * 7;
  return Math.min(mode === "target-size" ? 180 : 120, Math.max(mode === "target-size" ? 35 : 20, Math.round(baseSeconds)));
}

function elapsedSeconds(startedAt: number | undefined, now: number) {
  if (!startedAt) return 0;
  return Math.max(0, Math.floor((now - startedAt) / 1000));
}

function compressionProgress(job: PublicCloudJob | undefined, uploading: boolean, now: number, startedAt: number | undefined, estimatedTotalSeconds: number) {
  const elapsed = elapsedSeconds(startedAt, now);
  if (uploading) return Math.min(22, 10 + elapsed * 3);
  if (!job) return 0;
  if (job.state === "failed" || job.state === "cancelled" || job.state === "expired" || job.state === "deleted") return 0;
  if (job.state === "complete") return 100;

  const timeBasedProgress = Math.min(91, 44 + Math.round((elapsed / estimatedTotalSeconds) * 47));
  if (job.subStage === "generating-candidate" && job.attemptsUsed && job.maximumAttempts) {
    const attemptProgress = 35 + Math.round((job.attemptsUsed / job.maximumAttempts) * 50);
    return Math.min(91, Math.max(attemptProgress, timeBasedProgress));
  }
  if (job.subStage === "validating-candidate") return 72;
  if (job.subStage === "comparing-result") return 82;
  if (job.subStage === "selecting-best-output") return 90;
  if (job.subStage === "finalising-output") return 96;

  const values: Record<PublicCloudJob["state"], number> = {
    "awaiting-upload": 0,
    created: 28,
    queued: 36,
    validating: 44,
    processing: Math.max(68, timeBasedProgress),
    "validating-output": 92,
    complete: 100,
    failed: 0,
    expired: 0,
    cancelled: 0,
    deleted: 0,
  };
  return values[job.state];
}

function estimatedTimeLabel(job: PublicCloudJob | undefined, uploading: boolean, now: number, startedAt: number | undefined, estimatedTotalSeconds: number) {
  if (!uploading && !isActiveJob(job)) return undefined;
  const elapsed = elapsedSeconds(startedAt, now);
  if (elapsed > estimatedTotalSeconds) return `Elapsed time: ${elapsed} sec. Still working on this PDF.`;
  return `Estimated total time: about ${estimatedTotalSeconds} sec. Elapsed: ${elapsed} sec.`;
}

function validatePdf(file: File) {
  if (!file.name.toLowerCase().endsWith(".pdf") || (file.type && file.type !== "application/pdf")) {
    return "Choose a valid PDF file.";
  }
  if (!file.size) return "Choose a non-empty PDF file.";
  if (file.size > maxUploadBytes) return "Choose a PDF smaller than 25 MB.";
  return "";
}

function getCloudErrorMessage(error: unknown) {
  if (error instanceof TypeError) {
    return "Paperlane cloud processing is unavailable. Confirm the API and worker are running, then try again.";
  }
  return error instanceof Error ? error.message : "Paperlane cloud processing is unavailable.";
}

export function CompressPdfPage() {
  const navigate = useNavigate();
  const tool = getToolById("compress-pdf");
  const Icon = tool.icon;
  const relatedTools = ["pdf-to-jpg", "remove-blank-pages", "jpg-to-pdf"]
    .map((toolId) => tools.find((item) => item.id === toolId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const [file, setFile] = useState<File | null>(null);
  const [compressionMode, setCompressionMode] = useState<CompressionRequest["mode"]>("preset");
  const [preset, setPreset] = useState<CompressionPreset>("balanced");
  const [targetValue, setTargetValue] = useState("");
  const [targetUnit, setTargetUnit] = useState<TargetSizeUnit>("KB");
  const [consent, setConsent] = useState(false);
  const [job, setJob] = useState<PublicCloudJob | undefined>();
  const [jobToken, setJobToken] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isReady, setIsReady] = useState<boolean | undefined>();
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const [progressNow, setProgressNow] = useState(() => Date.now());
  const [workflowStartedAt, setWorkflowStartedAt] = useState<number>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  usePageMetadata({
    title: "Compress PDF Online | Paperlane",
    description: "Reduce PDF file size using temporary isolated cloud processing with clear retention and deletion controls.",
  });

  const refreshCloudReadiness = useCallback(async () => {
    try {
      await checkCloudReadiness();
      setIsReady(true);
    } catch {
      setIsReady(false);
    }
  }, []);

  useEffect(() => {
    void refreshCloudReadiness();
    const timer = window.setInterval(() => {
      void refreshCloudReadiness();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [refreshCloudReadiness]);

  useEffect(() => {
    if (!job || !jobToken) return undefined;
    if (!isActiveJob(job)) return undefined;
    const timer = window.setInterval(() => {
      void getCompressionJob(job.jobId, jobToken)
        .then(({ job: nextJob }) => {
          setIsReady(true);
          setError("");
          setJob(nextJob);
        })
        .catch((pollError: unknown) => {
          setIsReady(false);
          setError(getCloudErrorMessage(pollError));
        });
    }, 1500);
    return () => window.clearInterval(timer);
  }, [job, jobToken]);

  useEffect(() => {
    if (!isUploading && !isActiveJob(job)) return undefined;
    const timer = window.setInterval(() => setProgressNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isUploading, job]);

  const selectedError = useMemo(() => (file ? validatePdf(file) : ""), [file]);
  const recommendedTarget = useMemo(() => recommendTargetSize(file?.size), [file?.size]);
  const targetBytes = useMemo(() => targetBytesFromInput(targetValue, targetUnit), [targetUnit, targetValue]);
  const targetError = useMemo(() => {
    if (compressionMode !== "target-size") return "";
    return validateTargetSize({ value: targetValue, unit: targetUnit, originalBytes: file?.size, maxUploadBytes });
  }, [compressionMode, file?.size, targetUnit, targetValue]);
  const compressionRequest = useMemo<CompressionRequest | undefined>(() => {
    if (compressionMode === "preset") return { mode: "preset", preset };
    if (!targetBytes || targetError) return undefined;
    return { mode: "target-size", targetBytes };
  }, [compressionMode, preset, targetBytes, targetError]);
  const canStart = Boolean(file && consent && compressionRequest && !isUploading && (!job || ["failed", "cancelled", "expired", "deleted"].includes(job.state)));
  const estimatedTotal = estimateTotalSeconds(file?.size, compressionMode);
  const progressValue = compressionProgress(job, isUploading, progressNow, workflowStartedAt, estimatedTotal);
  const timeLabel = estimatedTimeLabel(job, isUploading, progressNow, workflowStartedAt, estimatedTotal);
  const showProgress = isUploading || Boolean(job);
  const outputIsLarger = Boolean(job?.compression?.outputLarger);

  function selectFile(nextFile?: File) {
    setFile(nextFile ?? null);
    setJob(undefined);
    setJobToken("");
    setError("");
    setWorkflowStartedAt(undefined);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleUploadKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  }

  function handleUploadDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingUpload(false);
    selectFile(event.dataTransfer.files[0]);
  }

  async function startCompression() {
    if (!file) return;
    const fileError = validatePdf(file);
    if (fileError) {
      setError(fileError);
      return;
    }
    if (!compressionRequest) {
      setError(targetError || "Choose a valid compression mode.");
      return;
    }
    setError("");
    setProgressNow(Date.now());
    setWorkflowStartedAt(Date.now());
    setIsUploading(true);
    try {
      const created = await createCompressionJob(compressionRequest);
      setJob(created.job);
      setJobToken(created.jobToken);
      const uploadedJob = await uploadCompressionInput(created.job.jobId, created.jobToken, file);
      setJob(uploadedJob);
      const started = await startCompressionJob(uploadedJob.jobId, created.jobToken);
      setJob(started.job);
    } catch (cloudError) {
      setError(getCloudErrorMessage(cloudError));
    } finally {
      setIsUploading(false);
    }
  }

  async function deleteNow() {
    if (!job || !jobToken) return;
    try {
      const deleted = await deleteCompressionJob(job.jobId, jobToken);
      setError("");
      setJob(deleted.job);
    } catch (deleteError) {
      setError(getCloudErrorMessage(deleteError));
    }
  }

  function reset() {
    setFile(null);
    setConsent(false);
    setJob(undefined);
    setJobToken("");
    setError("");
    setWorkflowStartedAt(undefined);
  }

  return (
    <>
      <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <li><Link to="/" className="font-medium hover:text-foreground">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link to="/tools" className="font-medium hover:text-foreground">Tools</Link></li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-foreground" aria-current="page">Compress PDF</li>
        </ol>
      </nav>

      <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)]">
        <section className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <Badge variant="outline">Temporary cloud processing</Badge>
              <Badge variant="secondary">Optimise</Badge>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Compress PDF with temporary cloud processing.</h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              PDF compression needs an isolated worker with Ghostscript, so this tool uploads one PDF only after explicit consent.
            </p>
          </div>

          <Alert>
            <UploadCloud className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Cloud-processing disclosure</AlertTitle>
            <AlertDescription>
              This tool requires temporary cloud processing. Your PDF will be uploaded to Paperlane's processing service,
              compressed in an isolated job environment and deleted according to the retention period shown below.
              Use Paperlane's browser-local tools for documents that do not require cloud processing.
            </AlertDescription>
          </Alert>

          <Card className="shadow-none">
            <CardContent className="space-y-4 p-5 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Maximum file size:</strong> 25 MB.</p>
              <p><strong className="text-foreground">Retention:</strong> {retentionCopy}</p>
              <p>Keep this page open until your download is ready. Refreshing or closing the page may prevent access to the temporary result.</p>
              {isReady === false ? (
                <p className="font-medium text-destructive">The cloud API is not reachable. Start Docker Desktop and the API/worker, then Paperlane will reconnect automatically.</p>
              ) : null}
            </CardContent>
          </Card>

          <Button asChild variant="outline">
            <Link to="/tools"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to all tools</Link>
          </Button>
        </section>

        <section aria-label="Compress PDF workflow" className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="grid gap-2">
            <Label htmlFor="compress-file">Select one PDF</Label>
            <Input
              ref={fileInputRef}
              id="compress-file"
              type="file"
              className="sr-only"
              accept=".pdf,application/pdf"
              onChange={(event) => {
                selectFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload one PDF. Click, drop, or press Enter to choose a PDF."
              onClick={openFilePicker}
              onKeyDown={handleUploadKeyDown}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDraggingUpload(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingUpload(true);
              }}
              onDragLeave={() => setIsDraggingUpload(false)}
              onDrop={handleUploadDrop}
              className={`flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isDraggingUpload ? "border-primary bg-primary/10 shadow-sm" : "border-primary/30 bg-gradient-to-b from-secondary/50 to-background hover:border-primary/50 hover:bg-secondary/45"
              }`}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <UploadCloud className="h-7 w-7" aria-hidden="true" />
              </span>
              <strong className="mt-4 text-lg font-semibold text-foreground">Upload your PDF here</strong>
              <span className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                Click this area or drag one PDF from your device.
              </span>
              <span className="mt-1 text-xs text-muted-foreground">Accepted: .pdf</span>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
                <FilePlus2 className="h-4 w-4 text-primary" aria-hidden="true" />
                Select PDF
              </span>
            </div>
            <Button type="button" variant="outline" onClick={openFilePicker}>
              Browse from device
            </Button>
            {file ? <p className="text-sm text-muted-foreground">{file.name} · {formatFileSize(file.size)}</p> : null}
            {selectedError ? <p className="text-sm text-destructive">{selectedError}</p> : null}
          </div>

          <div className="grid gap-3">
            <Label>Compression mode</Label>
            <RadioGroup
              value={compressionMode}
              onValueChange={(value) => setCompressionMode(value as CompressionRequest["mode"])}
              className="grid gap-3 sm:grid-cols-2"
            >
              <Label
                htmlFor="compression-mode-preset"
                className="flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-4 transition-colors hover:bg-muted/30 has-[[data-state=checked]]:border-primary/60 has-[[data-state=checked]]:bg-secondary/45"
              >
                <RadioGroupItem id="compression-mode-preset" value="preset" className="mt-1" />
                <span className="grid gap-1">
                  <span className="font-semibold text-foreground">Let Paperlane choose</span>
                  <span className="text-sm leading-6 text-muted-foreground">Best for quick compression with a balanced result.</span>
                </span>
              </Label>
              <Label
                htmlFor="compression-mode-target"
                className="flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-4 transition-colors hover:bg-muted/30 has-[[data-state=checked]]:border-primary/60 has-[[data-state=checked]]:bg-secondary/45"
              >
                <RadioGroupItem id="compression-mode-target" value="target-size" className="mt-1" />
                <span className="grid gap-1">
                  <span className="font-semibold text-foreground">Choose a smaller file size</span>
                  <span className="text-sm leading-6 text-muted-foreground">Best when you need the PDF near a specific upload limit.</span>
                </span>
              </Label>
            </RadioGroup>
          </div>

          {compressionMode === "preset" ? (
            <div className="grid gap-2">
              <Label>Compression preset</Label>
              <Select value={preset} onValueChange={(value) => setPreset(value as CompressionPreset)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-quality">High quality</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="smallest-size">Smallest size</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
                <div className="grid gap-2">
                  <Label htmlFor="target-size-value">Desired file size</Label>
                  <Input
                    id="target-size-value"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="200"
                    value={targetValue}
                    aria-describedby="target-size-help target-size-error"
                    onChange={(event) => setTargetValue(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Unit</Label>
                  <Select value={targetUnit} onValueChange={(value) => setTargetUnit(value as TargetSizeUnit)}>
                    <SelectTrigger aria-label="Target size unit"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KB">KB</SelectItem>
                      <SelectItem value="MB">MB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p id="target-size-help" className="text-sm leading-6 text-muted-foreground">
                Paperlane will try several controlled compression settings and return the highest-quality valid result at or below your target when possible.
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Very small targets may cause substantial image-quality loss and may be impossible for long, text-heavy or already optimised PDFs.
              </p>
              {file && recommendedTarget && !job?.compression ? (
                <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-secondary/40 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">
                      Recommended starting target: {formatFileSize(recommendedTarget.bytes)}
                    </p>
                    <p className="leading-6 text-muted-foreground">
                      Based on this PDF's {formatFileSize(file.size)} size. Lower targets may work, but quality can drop quickly.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTargetValue(recommendedTarget.value);
                      setTargetUnit(recommendedTarget.unit);
                    }}
                  >
                    Use recommended
                  </Button>
                </div>
              ) : null}
              {targetError ? <p id="target-size-error" className="text-sm text-destructive">{targetError}</p> : null}
            </div>
          )}

          <div className="flex items-start gap-3 rounded-xl border bg-muted/25 p-4">
            <Checkbox id="cloud-consent" checked={consent} onCheckedChange={(value) => setConsent(value === true)} />
            <Label htmlFor="cloud-consent" className="text-sm leading-6">
              I understand that this PDF will be temporarily uploaded for cloud processing.
            </Label>
          </div>

          <div className="rounded-xl border p-4" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold">Status: {stageLabel(job, isUploading)}</p>
              {showProgress ? <p className="text-sm font-semibold text-primary">{progressValue}%</p> : null}
            </div>
            {showProgress ? (
              <div className="mt-3 space-y-2">
                <Progress value={progressValue} aria-label={`Estimated compression progress: ${progressValue}%`} />
                {job?.state !== "complete" && job?.state !== "failed" && job?.state !== "cancelled" && job?.state !== "expired" && job?.state !== "deleted" ? (
                  <div className="space-y-1 text-xs leading-5 text-muted-foreground">
                    {timeLabel ? <p className="font-medium text-foreground">{timeLabel}</p> : null}
                    <p>Estimated progress. Larger or image-heavy PDFs can take longer, so keep this page open until the download is ready.</p>
                  </div>
                ) : null}
              </div>
            ) : null}
            {job?.compression ? (
              <div className="mt-3 grid gap-1 text-sm text-muted-foreground">
                {job.compression.targetBytes ? <p>Target maximum: {formatFileSize(job.compression.targetBytes)}</p> : null}
                <p>Original size: {formatFileSize(job.compression.originalBytes)}</p>
                <p>{outputIsLarger ? "Generated result" : job.compression.targetBytes && job.compression.targetMet === false ? "Smallest valid result" : "Compressed size"}: {formatFileSize(job.compression.outputBytes)}</p>
                {outputIsLarger ? (
                  <p className="font-medium text-foreground">No smaller output was created. The generated PDF is larger than the original, so use the original file instead.</p>
                ) : job.compression.targetBytes && job.compression.targetMet === false ? (
                  <p className="font-medium text-foreground">Target not reached. Paperlane reached the configured quality and safety limits before reaching the requested size.</p>
                ) : (
                  <p>
                    {job.compression.outputLarger
                      ? `The compressed output is ${Math.abs(job.compression.savedPercent)}% larger than the original. This document may already be optimised.`
                      : `Saved: ${formatFileSize(job.compression.savedBytes)} (${job.compression.savedPercent}%)`}
                  </p>
                )}
                {job.compression.targetBytes && job.compression.targetMet ? <p className="font-medium text-foreground">Target achieved</p> : null}
                {job.compression.qualityLabel ? <p>Quality setting: {job.compression.qualityLabel}</p> : null}
              </div>
            ) : null}
          </div>

          {error || job?.errorCategory ? (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error || "Paperlane could not complete this compression job."}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={startCompression} disabled={!canStart || Boolean(selectedError) || Boolean(targetError) || isReady === false}>
              Compress PDF
            </Button>
            <Button type="button" variant="outline" onClick={deleteNow} disabled={!job || !jobToken || job.state === "cancelled" || job.state === "expired" || job.state === "deleted"}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />Delete now
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!job) return;
                void downloadCompressionOutput(job, jobToken)
                  .then(() => setError(""))
                  .catch((downloadError: unknown) => setError(getCloudErrorMessage(downloadError)));
              }}
              disabled={!job?.canDownload || !jobToken || outputIsLarger}
            >
              <Download className="h-4 w-4" aria-hidden="true" />Download compressed PDF
            </Button>
            <Button type="button" variant="outline" onClick={reset}>Process another document</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/tools")}>Choose Another Tool</Button>
          </div>

          <Accordion type="single" collapsible className="rounded-xl border px-4">
            <AccordionItem value="item-1">
              <AccordionTrigger>Why does this tool use cloud processing?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Compression uses Ghostscript in an isolated worker container. Paperlane does not run native binaries in the browser.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Does this create a permanent document history?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No account or document history exists. Temporary job metadata is used to process, expire and clean up the job.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="grid gap-3 sm:grid-cols-3">
            {relatedTools.map((relatedTool) => {
              const RelatedIcon = relatedTool.icon;
              const route = getFunctionalToolRoute(relatedTool);
              return (
                <Card key={relatedTool.id} className="shadow-none">
                  <CardContent className="flex h-full flex-col gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                        <RelatedIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <h2 className="text-sm font-semibold">{relatedTool.name}</h2>
                        <p className="text-xs text-muted-foreground">{getToolStatusLabel(relatedTool)}</p>
                      </div>
                    </div>
                    {route ? (
                      <Button asChild variant="outline" className="mt-auto justify-between">
                        <Link to={route}>
                          Open tool
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" disabled className="mt-auto cursor-not-allowed opacity-60">
                        Coming soon
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
