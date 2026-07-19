import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Download, Trash2, UploadCloud } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatFileSize } from "@/lib/file-demo";
import { usePageMetadata } from "@/lib/use-page-metadata";
import type { CompressionPreset, PublicCloudJob } from "@/types/cloud-processing";

const maxUploadBytes = 25 * 1024 * 1024;
const retentionCopy = "30 minutes for uploaded inputs that are not processed, and 30 minutes for completed outputs.";

function stageLabel(job?: PublicCloudJob, uploading = false) {
  if (uploading) return "Uploading";
  if (!job) return "Ready";
  const labels: Record<PublicCloudJob["state"], string> = {
    created: "Validating",
    "awaiting-upload": "Ready",
    queued: "Queued",
    validating: "Validating",
    processing: "Compressing",
    "validating-output": "Checking output",
    complete: "Ready",
    failed: "Failed",
    expired: "Expired",
    cancelled: "Cancelled",
  };
  return labels[job.state];
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
  const [preset, setPreset] = useState<CompressionPreset>("balanced");
  const [consent, setConsent] = useState(false);
  const [job, setJob] = useState<PublicCloudJob | undefined>();
  const [jobToken, setJobToken] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isReady, setIsReady] = useState<boolean | undefined>();

  usePageMetadata({
    title: "Compress PDF Online | Paperlane",
    description: "Reduce PDF file size using temporary isolated cloud processing with clear retention and deletion controls.",
  });

  useEffect(() => {
    void checkCloudReadiness()
      .then(() => setIsReady(true))
      .catch(() => setIsReady(false));
  }, []);

  useEffect(() => {
    if (!job || !jobToken) return undefined;
    if (["complete", "failed", "expired", "cancelled"].includes(job.state)) return undefined;
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

  const canStart = Boolean(file && consent && !isUploading && (!job || ["failed", "cancelled", "expired"].includes(job.state)));
  const selectedError = useMemo(() => (file ? validatePdf(file) : ""), [file]);

  async function startCompression() {
    if (!file) return;
    const fileError = validatePdf(file);
    if (fileError) {
      setError(fileError);
      return;
    }
    setError("");
    setIsUploading(true);
    try {
      const created = await createCompressionJob(preset);
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
                <p className="font-medium text-destructive">The local cloud API is not reachable. Start the API and worker before testing compression.</p>
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
              id="compress-file"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setJob(undefined);
                setJobToken("");
                setError("");
              }}
            />
            {file ? <p className="text-sm text-muted-foreground">{file.name} · {formatFileSize(file.size)}</p> : null}
            {selectedError ? <p className="text-sm text-destructive">{selectedError}</p> : null}
          </div>

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

          <div className="flex items-start gap-3 rounded-xl border bg-muted/25 p-4">
            <Checkbox id="cloud-consent" checked={consent} onCheckedChange={(value) => setConsent(value === true)} />
            <Label htmlFor="cloud-consent" className="text-sm leading-6">
              I understand that this PDF will be temporarily uploaded for cloud processing.
            </Label>
          </div>

          <div className="rounded-xl border p-4" aria-live="polite">
            <p className="text-sm font-semibold">Status: {stageLabel(job, isUploading)}</p>
            {job?.compression ? (
              <div className="mt-3 grid gap-1 text-sm text-muted-foreground">
                <p>Original size: {formatFileSize(job.compression.originalBytes)}</p>
                <p>Compressed size: {formatFileSize(job.compression.outputBytes)}</p>
                <p>
                  {job.compression.outputLarger
                    ? `The compressed output is ${Math.abs(job.compression.savedPercent)}% larger than the original. This document may already be optimised.`
                    : `Saved: ${formatFileSize(job.compression.savedBytes)} (${job.compression.savedPercent}%)`}
                </p>
              </div>
            ) : null}
          </div>

          {error || job?.errorCategory ? (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error || "Paperlane could not complete this compression job."}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={startCompression} disabled={!canStart || Boolean(selectedError) || isReady === false}>
              Compress PDF
            </Button>
            <Button type="button" variant="outline" onClick={deleteNow} disabled={!job || !jobToken || job.state === "cancelled" || job.state === "expired"}>
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
              disabled={!job?.canDownload || !jobToken}
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
