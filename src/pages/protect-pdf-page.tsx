import { useEffect, useMemo, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { ArrowLeft, Download, Eye, EyeOff, FilePlus2, ShieldCheck, Trash2, UploadCloud } from "lucide-react";
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
import { getToolById } from "@/data/tool-pages";
import { checkCloudReadiness } from "@/lib/cloud/compression-api";
import {
  createProtectionJob,
  deleteProtectionJob,
  downloadProtectionOutput,
  getProtectionJob,
  startProtectionJob,
  uploadProtectionInput,
} from "@/lib/cloud/protection-api";
import { formatFileSize } from "@/lib/file-demo";
import { usePageMetadata } from "@/lib/use-page-metadata";
import type { PublicCloudJob } from "@/types/cloud-processing";

const maxUploadBytes = 25 * 1024 * 1024;
const retentionCopy = "30 minutes for uploaded inputs that are not processed, and 30 minutes for completed outputs.";

function validatePdf(file: File) {
  if (!file.name.toLowerCase().endsWith(".pdf") || (file.type && file.type !== "application/pdf")) {
    return "Choose a valid PDF file.";
  }
  if (!file.size) return "Choose a non-empty PDF file.";
  if (file.size > maxUploadBytes) return "Choose a PDF smaller than 25 MB.";
  return "";
}

function validatePassword(password: string, confirmPassword: string) {
  if (!password) return "Enter a password for the protected PDF.";
  if (password.length < 6) return "Use at least 6 characters.";
  if (password.length > 128) return "Use 128 characters or fewer.";
  if (password !== confirmPassword) return "Passwords must match.";
  return "";
}

function getCloudErrorMessage(error: unknown) {
  if (error instanceof TypeError) {
    return "Paperlane cloud processing is unavailable. Confirm the API and worker are reachable, then try again.";
  }
  return error instanceof Error ? error.message : "Paperlane cloud processing is unavailable.";
}

function stageLabel(job?: PublicCloudJob, uploading = false) {
  if (uploading) return "Uploading";
  if (!job) return "Ready";
  if (job.subStage === "applying-password") return "Applying password";
  if (job.subStage === "validating-protected-output") return "Checking protected output";
  if (job.subStage === "finalising-output") return "Finalising output";
  const labels: Record<PublicCloudJob["state"], string> = {
    created: "Validating",
    "awaiting-upload": "Ready",
    queued: "Queued",
    validating: "Validating",
    processing: "Protecting",
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

function protectionProgress(job: PublicCloudJob | undefined, uploading: boolean) {
  if (uploading) return 22;
  if (!job) return 0;
  if (job.state === "complete") return 100;
  if (job.state === "failed" || job.state === "cancelled" || job.state === "expired" || job.state === "deleted") return 0;
  if (job.subStage === "applying-password") return 68;
  if (job.subStage === "validating-protected-output") return 88;
  if (job.subStage === "finalising-output") return 96;
  const values: Record<PublicCloudJob["state"], number> = {
    "awaiting-upload": 0,
    created: 28,
    queued: 36,
    validating: 44,
    processing: 70,
    "validating-output": 92,
    complete: 100,
    failed: 0,
    expired: 0,
    cancelled: 0,
    deleted: 0,
  };
  return values[job.state];
}

export function ProtectPdfPage() {
  const navigate = useNavigate();
  const tool = getToolById("protect-pdf");
  const Icon = tool.icon;
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [job, setJob] = useState<PublicCloudJob | undefined>();
  const [jobToken, setJobToken] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isReady, setIsReady] = useState<boolean | undefined>();
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  usePageMetadata({
    title: "Protect PDF Online | Paperlane",
    description: "Add password protection to a PDF using temporary isolated cloud processing with clear retention and deletion controls.",
  });

  useEffect(() => {
    void checkCloudReadiness()
      .then(() => setIsReady(true))
      .catch(() => setIsReady(false));
  }, []);

  useEffect(() => {
    if (!job || !jobToken || !isActiveJob(job)) return undefined;
    const timer = window.setInterval(() => {
      void getProtectionJob(job.jobId, jobToken)
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

  const selectedError = useMemo(() => (file ? validatePdf(file) : ""), [file]);
  const passwordError = useMemo(() => validatePassword(password, confirmPassword), [confirmPassword, password]);
  const canStart = Boolean(file && consent && !selectedError && !passwordError && !isUploading && (!job || ["failed", "cancelled", "expired", "deleted"].includes(job.state)));
  const progressValue = protectionProgress(job, isUploading);
  const showProgress = isUploading || Boolean(job);

  function selectFile(nextFile?: File) {
    setFile(nextFile ?? null);
    setJob(undefined);
    setJobToken("");
    setError("");
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

  async function startProtection() {
    if (!file) return;
    const fileError = validatePdf(file);
    const localPasswordError = validatePassword(password, confirmPassword);
    if (fileError || localPasswordError) {
      setError(fileError || localPasswordError);
      return;
    }
    setError("");
    setIsUploading(true);
    try {
      const created = await createProtectionJob({ mode: "password", userPassword: password });
      setJob(created.job);
      setJobToken(created.jobToken);
      const uploadedJob = await uploadProtectionInput(created.job.jobId, created.jobToken, file);
      setJob(uploadedJob);
      const started = await startProtectionJob(uploadedJob.jobId, created.jobToken);
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
      const deleted = await deleteProtectionJob(job.jobId, jobToken);
      setError("");
      setJob(deleted.job);
    } catch (deleteError) {
      setError(getCloudErrorMessage(deleteError));
    }
  }

  function reset() {
    setFile(null);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setConsent(false);
    setJob(undefined);
    setJobToken("");
    setError("");
  }

  return (
    <>
      <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <li><Link to="/" className="font-medium hover:text-foreground">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link to="/tools" className="font-medium hover:text-foreground">Tools</Link></li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-foreground" aria-current="page">Protect PDF</li>
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
              <Badge variant="secondary">Security</Badge>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Protect PDF with a password.</h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Add open-password protection to one PDF using Paperlane's isolated cloud worker after explicit consent.
            </p>
          </div>

          <Alert>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Cloud-processing disclosure</AlertTitle>
            <AlertDescription>
              This tool temporarily uploads your PDF and the password you enter to Paperlane's processing service.
              The password is used only for the job, then removed from job metadata after completion, cancellation or failure.
            </AlertDescription>
          </Alert>

          <Card className="shadow-none">
            <CardContent className="space-y-4 p-5 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Maximum file size:</strong> 25 MB.</p>
              <p><strong className="text-foreground">Retention:</strong> {retentionCopy}</p>
              <p>Keep this page open until your download is ready. Refreshing or closing the page may prevent access to the temporary result.</p>
              {isReady === false ? (
                <p className="font-medium text-destructive">The cloud API is not reachable. Confirm the API and worker are running before testing protection.</p>
              ) : null}
            </CardContent>
          </Card>

          <Button asChild variant="outline">
            <Link to="/tools"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to all tools</Link>
          </Button>
        </section>

        <section aria-label="Protect PDF workflow" className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="grid gap-2">
            <Label htmlFor="protect-file">Select one PDF</Label>
            <Input
              ref={fileInputRef}
              id="protect-file"
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
              <span className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">Click this area or drag one PDF from your device.</span>
              <span className="mt-1 text-xs text-muted-foreground">Accepted: .pdf</span>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
                <FilePlus2 className="h-4 w-4 text-primary" aria-hidden="true" />
                Select PDF
              </span>
            </div>
            <Button type="button" variant="outline" onClick={openFilePicker}>Browse from device</Button>
            {file ? <p className="text-sm text-muted-foreground">{file.name} · {formatFileSize(file.size)}</p> : null}
            {selectedError ? <p className="text-sm text-destructive">{selectedError}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="protect-password">PDF password</Label>
              <div className="relative">
                <Input
                  id="protect-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    const nextPassword = event.target.value;
                    setPassword(nextPassword);
                    if (!nextPassword) {
                      setShowPassword(false);
                    }
                  }}
                  autoComplete="new-password"
                  className={password ? "pr-11" : undefined}
                />
                {password ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide PDF password" : "Show PDF password"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="protect-confirm-password">Confirm password</Label>
              <Input id="protect-confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
            </div>
          </div>
          {passwordError && (password || confirmPassword) ? <p className="text-sm text-destructive">{passwordError}</p> : null}
          <p className="text-sm leading-6 text-muted-foreground">
            Save this password somewhere safe. Paperlane cannot recover it after the temporary job finishes.
          </p>

          <div className="flex items-start gap-3 rounded-xl border bg-muted/25 p-4">
            <Checkbox id="protect-cloud-consent" checked={consent} onCheckedChange={(value) => setConsent(value === true)} />
            <Label htmlFor="protect-cloud-consent" className="text-sm leading-6">
              I understand that this PDF and password will be temporarily uploaded for cloud processing.
            </Label>
          </div>

          <div className="rounded-xl border p-4" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold">Status: {stageLabel(job, isUploading)}</p>
              {showProgress ? <p className="text-sm font-semibold text-primary">{progressValue}%</p> : null}
            </div>
            {showProgress ? <Progress className="mt-3" value={progressValue} aria-label={`Estimated protection progress: ${progressValue}%`} /> : null}
            {job?.protection ? (
              <div className="mt-3 grid gap-1 text-sm text-muted-foreground">
                <p>Original size: {formatFileSize(job.protection.originalBytes)}</p>
                <p>Protected PDF size: {formatFileSize(job.protection.outputBytes)}</p>
                <p>Pages preserved: {job.protection.pageCount}</p>
                <p className="font-medium text-foreground">Password protection applied. Open the downloaded PDF to verify the password prompt.</p>
              </div>
            ) : null}
          </div>

          {error || job?.errorCategory ? (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error || "Paperlane could not complete this protection job."}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={startProtection} disabled={!canStart || isReady === false}>Protect PDF</Button>
            <Button type="button" variant="outline" onClick={deleteNow} disabled={!job || !jobToken || job.state === "cancelled" || job.state === "expired" || job.state === "deleted"}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />Delete now
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!job) return;
                void downloadProtectionOutput(job, jobToken)
                  .then(() => setError(""))
                  .catch((downloadError: unknown) => setError(getCloudErrorMessage(downloadError)));
              }}
              disabled={!job?.canDownload || !jobToken}
            >
              <Download className="h-4 w-4" aria-hidden="true" />Download protected PDF
            </Button>
            <Button type="button" variant="outline" onClick={reset}>Process another document</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/tools")}>Choose Another Tool</Button>
          </div>

          <Accordion type="single" collapsible className="rounded-xl border px-4">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is this browser-local?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No. PDF password protection uses Ghostscript in a temporary worker container, so it requires explicit cloud-processing consent.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can Paperlane recover my password?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No. The password is only used to create the protected output and is cleared from job metadata when processing completes, fails or is cancelled.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>
    </>
  );
}
