import { useCallback, useEffect, useRef, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowDown, ArrowUp, Eraser, File, FilePlus2, MoveHorizontal, Trash2, Upload } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";
import { GeneratedOutputList } from "@/components/tools/generated-output";
import { LocalProcessingStatus } from "@/components/tools/local-processing-status";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { validateImageFile, validateImageFiles, validateMergeFiles, validatePdfFile } from "@/lib/pdf/file-validation";
import { detectBlankImageData } from "@/lib/pdf/blank-page-detection";
import { createGeneratedOutput, revokeGeneratedOutputs } from "@/lib/pdf/download-file";
import { imagesToPdf } from "@/lib/pdf/images-to-pdf";
import { mergePdfFiles } from "@/lib/pdf/merge-pdf";
import { parsePageRange } from "@/lib/pdf/page-range";
import { PdfProcessingError, toUserFacingPdfError } from "@/lib/pdf/pdf-errors";
import { pdfPagesToImages } from "@/lib/pdf/pdf-to-images";
import { readFileBytes } from "@/lib/pdf/read-file-bytes";
import { removePdfPages } from "@/lib/pdf/remove-blank-pages";
import { createInitialPageOrder, movePageInOrder } from "@/lib/pdf/reorder-utils";
import { reorderPdfPages } from "@/lib/pdf/reorder-pdf";
import { rotatePdfPages } from "@/lib/pdf/rotate-pdf";
import { extractPdfPages, getPdfPageCount, splitPdfEveryPage } from "@/lib/pdf/split-pdf";
import { visualSignPdf, type VisualSignatureInput } from "@/lib/pdf/visual-sign-pdf";
import { watermarkPdf } from "@/lib/pdf/watermark-pdf";
import { formatFileSize, getFileExtension } from "@/lib/file-demo";
import { cn } from "@/lib/utils";
import type { DocumentTool } from "@/types/tool";
import type {
  GeneratedOutput,
  ImagePdfMargin,
  ImagePdfPageSize,
  PdfImageExportFormat,
  ProcessingStatus,
  RotationOption,
  SignatureMode,
  SplitMode,
  WatermarkPosition,
} from "@/types/processing";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

type PagePreviewUrls = Record<number, string>;

function revokePagePreviewUrls(previews: PagePreviewUrls) {
  Object.values(previews).forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new PdfProcessingError("Paperlane could not create a page preview."));
    }, "image/png");
  });
}

async function readPageCount(file: File) {
  validatePdfFile(file);
  return getPdfPageCount(file);
}

type LocalFile = {
  id: string;
  file: File;
};

type FileSystemFileHandleLike = {
  getFile: () => Promise<File>;
};

type WindowWithFilePicker = Window & {
  showOpenFilePicker?: (options?: {
    excludeAcceptAllOption?: boolean;
    multiple?: boolean;
  }) => Promise<FileSystemFileHandleLike[]>;
};

type FunctionalToolWorkflowProps = {
  tool: DocumentTool;
  onChooseAnother: () => void;
};

export function FunctionalToolWorkflow({ tool, onChooseAnother }: FunctionalToolWorkflowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const signatureImageInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const pagePreviewUrlsRef = useRef<PagePreviewUrls>({});
  const addFilesRef = useRef<(incomingFiles: FileList | File[]) => Promise<void>>(async () => undefined);
  const canProcessRef = useRef(false);
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [pagePreviewUrls, setPagePreviewUrls] = useState<PagePreviewUrls>({});
  const [pageCount, setPageCount] = useState(0);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [error, setError] = useState("");
  const [outputs, setOutputs] = useState<GeneratedOutput[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>("extract");
  const [pageRange, setPageRange] = useState("1");
  const [rotation, setRotation] = useState<RotationOption>("90-clockwise");
  const [applyMode, setApplyMode] = useState<"all" | "range">("all");
  const [imagePageSize, setImagePageSize] = useState<ImagePdfPageSize>("fit");
  const [imageMargin, setImageMargin] = useState<ImagePdfMargin>("small");
  const [watermarkText, setWatermarkText] = useState("Confidential");
  const [watermarkSize, setWatermarkSize] = useState(36);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.35);
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>("centre");
  const [pdfImageFormat, setPdfImageFormat] = useState<PdfImageExportFormat>("jpg");
  const [blankPageSuggestions, setBlankPageSuggestions] = useState<number[]>([]);
  const [blankPageSelections, setBlankPageSelections] = useState<number[]>([]);
  const [signatureMode, setSignatureMode] = useState<SignatureMode>("draw");
  const [signatureText, setSignatureText] = useState("");
  const [signatureImageFile, setSignatureImageFile] = useState<File | null>(null);
  const [signaturePage, setSignaturePage] = useState("1");
  const [signaturePosition, setSignaturePosition] = useState<WatermarkPosition>("bottom-right");
  const [signatureWidth, setSignatureWidth] = useState(28);
  const [isDrawingSignature, setIsDrawingSignature] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  const isImageTool = tool.id === "jpg-to-pdf";
  const isPdfToImagesTool = tool.id === "pdf-to-jpg";
  const isRemoveBlankPagesTool = tool.id === "remove-blank-pages";
  const isSignatureTool = tool.id === "sign-document";
  const allowMultiple = tool.id === "merge-pdf" || isImageTool;
  const accept = isImageTool ? ".jpg,.jpeg,.png" : undefined;
  const canProcess = status !== "validating" && status !== "reading" && status !== "processing" && status !== "preparing-output";
  const chooseFileLabel = isImageTool ? "Select JPG/PNG Images" : "Choose PDF Files";
  const dropzoneTitle = isImageTool ? "Drop JPG/PNG images here" : "Drop PDF files here";
  const acceptedFileSummary = isImageTool ? ".jpg, .jpeg, .png" : ".pdf";
  const primaryActionLabel = isImageTool
    ? outputs.length
      ? "Convert Again"
      : "Convert"
    : outputs.length
      ? "Process Again"
      : "Process Locally";

  const clearOutputs = () => {
    revokeGeneratedOutputs(outputs);
    setOutputs([]);
  };

  const replacePagePreviewUrls = useCallback((nextPreviewUrls: PagePreviewUrls) => {
    revokePagePreviewUrls(pagePreviewUrlsRef.current);
    pagePreviewUrlsRef.current = nextPreviewUrls;
    setPagePreviewUrls(nextPreviewUrls);
  }, []);

  const clearPagePreviewUrls = useCallback(() => {
    replacePagePreviewUrls({});
  }, [replacePagePreviewUrls]);

  function clearSignatureCanvas() {
    const canvas = signatureCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setIsDrawingSignature(false);
    setHasDrawnSignature(false);
  }

  function getSignatureCanvasPoint(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function startSignatureStroke(event: PointerEvent<HTMLCanvasElement>) {
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const point = getSignatureCanvasPoint(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    context.strokeStyle = "#111827";
    context.lineWidth = 4;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(point.x, point.y);
    setIsDrawingSignature(true);
    setHasDrawnSignature(true);
  }

  function continueSignatureStroke(event: PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingSignature) return;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const point = getSignatureCanvasPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function endSignatureStroke(event: PointerEvent<HTMLCanvasElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDrawingSignature(false);
  }

  const resetWorkflow = () => {
    clearOutputs();
    clearPagePreviewUrls();
    setFiles([]);
    setPageCount(0);
    setPageOrder([]);
    setStatus("idle");
    setError("");
    setSplitMode("extract");
    setPageRange("1");
    setRotation("90-clockwise");
    setApplyMode("all");
    setImagePageSize("fit");
    setImageMargin("small");
    setWatermarkText("Confidential");
    setWatermarkSize(36);
    setWatermarkOpacity(0.35);
    setWatermarkPosition("centre");
    setPdfImageFormat("jpg");
    setBlankPageSuggestions([]);
    setBlankPageSelections([]);
    setSignatureMode("draw");
    setSignatureText("");
    setSignatureImageFile(null);
    setSignaturePage("1");
    setSignaturePosition("bottom-right");
    setSignatureWidth(28);
    setHasDrawnSignature(false);
    clearSignatureCanvas();
  };

  useEffect(() => {
    return () => revokeGeneratedOutputs(outputs);
  }, [outputs]);

  useEffect(() => {
    return () => {
      revokePagePreviewUrls(pagePreviewUrlsRef.current);
    };
  }, []);

  const selectedFile = files[0];

  useEffect(() => {
    if ((tool.id !== "reorder-pages" && !isRemoveBlankPagesTool) || !selectedFile || !pageCount) return;

    let cancelled = false;

    const renderPagePreviews = async () => {
      const data = await readFileBytes(selectedFile.file);
      const loadingTask = pdfjsLib.getDocument({ data });
      const pdf = await loadingTask.promise;
      const nextPreviewUrls: PagePreviewUrls = {};
      const nextBlankSuggestions: number[] = [];

      try {
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) break;

          const page = await pdf.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = Math.min(0.7, 230 / baseViewport.width);
          const viewport = page.getViewport({ scale });
          const outputScale = Math.min(window.devicePixelRatio || 1, 2);
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) throw new PdfProcessingError("Paperlane could not create a page preview.");

          canvas.width = Math.ceil(viewport.width * outputScale);
          canvas.height = Math.ceil(viewport.height * outputScale);
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;
          context.scale(outputScale, outputScale);

          await page.render({ canvas, canvasContext: context, viewport }).promise;
          if (isRemoveBlankPagesTool) {
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            if (detectBlankImageData(imageData).isLikelyBlank) nextBlankSuggestions.push(pageNumber - 1);
          }
          const blob = await canvasToBlob(canvas);
          nextPreviewUrls[pageNumber - 1] = URL.createObjectURL(blob);
        }

        if (cancelled) {
          revokePagePreviewUrls(nextPreviewUrls);
          return;
        }

        replacePagePreviewUrls(nextPreviewUrls);
        if (isRemoveBlankPagesTool) {
          setBlankPageSuggestions(nextBlankSuggestions);
          setBlankPageSelections(nextBlankSuggestions);
        }
      } finally {
        await loadingTask.destroy();
      }
    };

    void renderPagePreviews().catch(() => {
      if (!cancelled) clearPagePreviewUrls();
    });

    return () => {
      cancelled = true;
    };
  }, [clearPagePreviewUrls, isRemoveBlankPagesTool, pageCount, replacePagePreviewUrls, selectedFile, tool.id]);

  const resetGeneratedState = () => {
    clearOutputs();
    setStatus("idle");
    setError("");
  };

  const addFiles = async (incomingFiles: FileList | File[]) => {
    const incoming = Array.from(incomingFiles);
    if (!incoming.length) return;

    resetGeneratedState();
    setStatus("validating");
    setBlankPageSuggestions([]);
    setBlankPageSelections([]);
    setSignaturePage("1");
    const nextFiles = allowMultiple ? [...files] : [];
    const limit = tool.id === "merge-pdf" ? 5 : isImageTool ? 10 : 1;

    try {
      for (const file of incoming) {
        if (isImageTool) validateImageFile(file);
        else validatePdfFile(file);
        await readFileBytes(file);
        if (nextFiles.length >= limit) {
          throw new PdfProcessingError(isImageTool ? "Choose up to 10 images." : "Merge PDF supports up to five files.", "TOO_MANY_FILES");
        }
        nextFiles.push({ id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`, file });
        if (!allowMultiple) break;
      }

      setFiles(nextFiles);
      setStatus("idle");
      if (isImageTool || allowMultiple) clearPagePreviewUrls();
      if (!isImageTool && nextFiles.length === 1) {
        const count = await readPageCount(nextFiles[0].file);
        setPageCount(count);
        setPageOrder(createInitialPageOrder(count));
        setPageRange(count > 1 ? `1-${Math.min(count, 3)}` : "1");
        setSignaturePage("1");
      }
    } catch (loadError) {
      setPageCount(0);
      setPageOrder([]);
      setBlankPageSuggestions([]);
      setBlankPageSelections([]);
      clearPagePreviewUrls();
      setError(toUserFacingPdfError(loadError));
      setStatus("error");
    }
  };

  const openFilePicker = () => {
    if (!canProcess) return;

    const filePicker = (window as WindowWithFilePicker).showOpenFilePicker;

    if (window.isSecureContext && filePicker) {
      void filePicker({ excludeAcceptAllOption: false, multiple: allowMultiple })
        .then(async (handles) => {
          const pickedFiles = await Promise.all(handles.map((handle) => handle.getFile()));
          await addFiles(pickedFiles);
        })
        .catch((pickerError: unknown) => {
          if (pickerError instanceof DOMException && pickerError.name === "AbortError") return;
          inputRef.current?.click();
        });
      return;
    }

    inputRef.current?.click();
  };

  const handleDropzoneKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openFilePicker();
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (canProcess) setIsDraggingFiles(true);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (canProcess) event.dataTransfer.dropEffect = "copy";
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDraggingFiles(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingFiles(false);
    if (!canProcess) return;
    void addFiles(event.dataTransfer.files);
  };

  useEffect(() => {
    addFilesRef.current = addFiles;
    canProcessRef.current = canProcess;
  });

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    if (!canProcess || !event.clipboardData.files.length) return;
    event.preventDefault();
    void addFiles(event.clipboardData.files);
  };

  useEffect(() => {
    const pasteHandler = (event: globalThis.ClipboardEvent) => {
      if (!canProcessRef.current || !event.clipboardData?.files.length) return;
      event.preventDefault();
      void addFilesRef.current(event.clipboardData.files);
    };

    window.addEventListener("paste", pasteHandler);
    return () => window.removeEventListener("paste", pasteHandler);
  }, []);

  const removeFile = (id: string) => {
    resetGeneratedState();
    const next = files.filter((item) => item.id !== id);
    setFiles(next);
    if (!next.length) {
      setPageCount(0);
      setPageOrder([]);
      setBlankPageSuggestions([]);
      setBlankPageSelections([]);
      clearPagePreviewUrls();
    }
  };

  const moveFile = (id: string, direction: "up" | "down") => {
    const index = files.findIndex((item) => item.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= files.length) return;
    const next = [...files];
    [next[index], next[target]] = [next[target], next[index]];
    setFiles(next);
    resetGeneratedState();
  };

  const movePage = (pageIndex: number, targetIndex: number) => {
    const index = pageOrder.indexOf(pageIndex);
    if (index < 0 || targetIndex < 0 || targetIndex >= pageOrder.length) return;
    setPageOrder(movePageInOrder(pageOrder, pageIndex, targetIndex));
    resetGeneratedState();
  };

  const selectedPages = () => {
    if (applyMode === "all") return Array.from({ length: pageCount }, (_, index) => index);
    return parsePageRange(pageRange, pageCount);
  };

  const toggleBlankPageSelection = (pageIndex: number, checked: boolean) => {
    setBlankPageSelections((current) => {
      const next = new Set(current);
      if (checked) next.add(pageIndex);
      else next.delete(pageIndex);
      return [...next].sort((a, b) => a - b);
    });
    resetGeneratedState();
  };

  const getDrawnSignatureInput = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas || !hasDrawnSignature) {
      throw new PdfProcessingError("Draw a signature before processing.", "INVALID_WATERMARK");
    }

    return new Promise<VisualSignatureInput>((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new PdfProcessingError("Paperlane could not create your drawn signature.", "PROCESSING_FAILED"));
          return;
        }

        resolve({
          kind: "image",
          bytes: new Uint8Array(await blob.arrayBuffer()),
          mimeType: "image/png",
        });
      }, "image/png");
    });
  };

  const getSignatureInput = async (): Promise<VisualSignatureInput> => {
    if (signatureMode === "type") return { kind: "typed", text: signatureText };
    if (signatureMode === "upload") {
      if (!signatureImageFile) throw new PdfProcessingError("Upload a signature image before processing.", "INVALID_IMAGE");
      validateImageFile(signatureImageFile);
      return {
        kind: "image",
        bytes: await readFileBytes(signatureImageFile),
        mimeType: signatureImageFile.type || (signatureImageFile.name.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg"),
      };
    }

    return getDrawnSignatureInput();
  };

  const requireFiles = () => {
    if (!files.length) {
      throw new PdfProcessingError(
        isImageTool ? "Select at least one JPG or PNG image before converting." : "Choose a file before processing.",
      );
    }
    if (tool.id === "merge-pdf" && files.length < 2) {
      throw new PdfProcessingError("Choose at least two PDF files to merge.");
    }
    const selectedFiles = files.map((item) => item.file);
    if (tool.id === "merge-pdf") validateMergeFiles(selectedFiles);
    else if (isImageTool) validateImageFiles(selectedFiles);
    else validatePdfFile(selectedFiles[0]);
    return selectedFiles;
  };

  const processTool = async () => {
    if (!canProcess) return;
    setStatus("validating");
    setError("");
    clearOutputs();

    try {
      const selectedFiles = requireFiles();
      setStatus("reading");
      setStatus("processing");
      let generated: GeneratedOutput[] = [];

      if (tool.id === "merge-pdf") {
        generated = [createGeneratedOutput(await mergePdfFiles(selectedFiles), "paperlane-merged.pdf")];
      } else if (tool.id === "split-pdf") {
        if (splitMode === "every-page") {
          const pages = await splitPdfEveryPage(selectedFiles[0]);
          generated = pages.map((bytes, index) => createGeneratedOutput(bytes, `paperlane-page-${index + 1}.pdf`));
        } else {
          generated = [createGeneratedOutput(await extractPdfPages(selectedFiles[0], parsePageRange(pageRange, pageCount)), "paperlane-selected-pages.pdf")];
        }
      } else if (tool.id === "rotate-pdf") {
        generated = [createGeneratedOutput(await rotatePdfPages(selectedFiles[0], selectedPages(), rotation), "paperlane-rotated.pdf")];
      } else if (tool.id === "reorder-pages") {
        generated = [createGeneratedOutput(await reorderPdfPages(selectedFiles[0], pageOrder), "paperlane-reordered.pdf")];
      } else if (tool.id === "jpg-to-pdf") {
        generated = [createGeneratedOutput(await imagesToPdf(selectedFiles, imagePageSize, imageMargin), "paperlane-images.pdf")];
      } else if (tool.id === "pdf-to-jpg") {
        const imageOutputs = await pdfPagesToImages(selectedFiles[0], selectedPages(), pdfImageFormat);
        generated = imageOutputs.map((output) => createGeneratedOutput(output.bytes, output.filename, output.mimeType));
      } else if (tool.id === "remove-blank-pages") {
        generated = [createGeneratedOutput(await removePdfPages(selectedFiles[0], blankPageSelections), "paperlane-blank-pages-removed.pdf")];
      } else if (tool.id === "add-watermark") {
        generated = [
          createGeneratedOutput(
            await watermarkPdf(selectedFiles[0], {
              text: watermarkText,
              fontSize: watermarkSize,
              opacity: watermarkOpacity,
              position: watermarkPosition,
              pageIndexes: selectedPages(),
            }),
            "paperlane-watermarked.pdf",
          ),
        ];
      } else if (tool.id === "sign-document") {
        generated = [
          createGeneratedOutput(
            await visualSignPdf(selectedFiles[0], {
              pageIndex: Number(signaturePage) - 1,
              position: signaturePosition,
              widthPercent: signatureWidth,
              input: await getSignatureInput(),
            }),
            "paperlane-visually-signed.pdf",
          ),
        ];
      }

      setStatus("preparing-output");
      setOutputs(generated);
      setStatus("complete");
      toast.success("Processing completed locally in your browser.");
    } catch (processingError) {
      setStatus("error");
      setError(toUserFacingPdfError(processingError));
    }
  };

  const inspectPdf = async () => {
    if (!files[0]) return;
    try {
      const pdf = await PDFDocument.load(await readFileBytes(files[0].file), { ignoreEncryption: false });
      setPageCount(pdf.getPageCount());
    } catch (loadError) {
      setError(toUserFacingPdfError(loadError));
      setStatus("error");
    }
  };

  return (
    <div className="space-y-5">
      <Alert>
        <AlertDescription>
          Your document is processed locally in this browser. It is not uploaded to a Paperlane server. Large or complex files may use significant browser memory during local processing.
        </AlertDescription>
      </Alert>

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={allowMultiple}
        onChange={(event) => {
          if (event.target.files) void addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <div
        role="button"
        tabIndex={canProcess ? 0 : -1}
        aria-disabled={!canProcess}
        aria-label={`${chooseFileLabel}. Accepted formats: ${acceptedFileSummary}.`}
        onClick={openFilePicker}
        onKeyDown={handleDropzoneKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        className={cn(
          "group flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center transition-colors",
          canProcess ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" : "cursor-not-allowed opacity-60",
          isDraggingFiles ? "border-primary bg-primary/10" : "border-border bg-muted/30 hover:bg-muted/45",
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <FilePlus2 className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="text-base font-semibold text-foreground">{dropzoneTitle}</span>
        <span className="text-sm text-muted-foreground">Accepted: {acceptedFileSummary}</span>
        <span className="max-w-sm text-xs leading-5 text-muted-foreground">
          If Windows disables Open, drag files here or copy them in File Explorer and press Ctrl+V.
        </span>
        <span className="rounded-full border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm">
          Click, drop, paste, or press Enter
        </span>
      </div>
      <Button type="button" variant="outline" onClick={openFilePicker} disabled={!canProcess}>
        {chooseFileLabel}
      </Button>

      {files.length ? (
        <div className="space-y-2">
          {files.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                <File className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(getFileExtension(item.file.name) || item.file.type || "file").toUpperCase()} · {formatFileSize(item.file.size)}
                </p>
              </div>
              <Badge variant="secondary">{index + 1}</Badge>
              {allowMultiple ? (
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => moveFile(item.id, "up")} disabled={index === 0 || !canProcess} aria-label={`Move ${item.file.name} up`}>
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => moveFile(item.id, "down")} disabled={index === files.length - 1 || !canProcess} aria-label={`Move ${item.file.name} down`}>
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              ) : null}
              <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(item.id)} disabled={!canProcess} aria-label={`Remove ${item.file.name}`}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {pageCount ? <p className="text-sm font-medium text-muted-foreground">Detected {pageCount} {pageCount === 1 ? "page" : "pages"}.</p> : null}

      {tool.id === "split-pdf" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Split mode</Label>
            <Select value={splitMode} onValueChange={(value) => setSplitMode(value as SplitMode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="extract">Extract page selection</SelectItem>
                <SelectItem value="every-page">Split every page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {splitMode === "extract" ? (
            <div className="grid gap-2">
              <Label htmlFor="split-page-range">Page range</Label>
              <Input id="split-page-range" value={pageRange} onChange={(event) => setPageRange(event.target.value)} placeholder="1-3,6" />
            </div>
          ) : null}
        </div>
      ) : null}

      {tool.id === "rotate-pdf" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label>Rotation</Label>
            <Select value={rotation} onValueChange={(value) => setRotation(value as RotationOption)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="90-clockwise">90° clockwise</SelectItem>
                <SelectItem value="90-counter-clockwise">90° counter-clockwise</SelectItem>
                <SelectItem value="180">180°</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PageRangeControls applyMode={applyMode} pageRange={pageRange} onApplyModeChange={setApplyMode} onPageRangeChange={setPageRange} />
        </div>
      ) : null}

      {tool.id === "reorder-pages" && pageOrder.length ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Current output order: {pageOrder.map((index) => `Page ${index + 1}`).join(", ")}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageOrder.map((pageIndex, currentIndex) => (
              <div key={pageIndex} className="rounded-lg border bg-card p-3">
                <div className="overflow-hidden rounded-md border bg-muted/35">
                  <div className="aspect-[3/4]">
                    {pagePreviewUrls[pageIndex] ? (
                      <img
                        className="h-full w-full object-contain"
                        src={pagePreviewUrls[pageIndex]}
                        alt={`Preview of page ${pageIndex + 1}`}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
                        Rendering page preview...
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Page {pageIndex + 1}</span>
                  <Badge variant="secondary">Output {currentIndex + 1}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  <Button type="button" size="sm" variant="outline" onClick={() => movePage(pageIndex, 0)} disabled={currentIndex === 0 || !canProcess} aria-label={`Move Page ${pageIndex + 1} to beginning`}>First</Button>
                  <Button type="button" size="icon-sm" variant="outline" onClick={() => movePage(pageIndex, currentIndex - 1)} disabled={currentIndex === 0 || !canProcess} aria-label={`Move Page ${pageIndex + 1} earlier`}><ArrowUp className="h-4 w-4" aria-hidden="true" /></Button>
                  <Button type="button" size="icon-sm" variant="outline" onClick={() => movePage(pageIndex, currentIndex + 1)} disabled={currentIndex === pageOrder.length - 1 || !canProcess} aria-label={`Move Page ${pageIndex + 1} later`}><ArrowDown className="h-4 w-4" aria-hidden="true" /></Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => movePage(pageIndex, pageOrder.length - 1)} disabled={currentIndex === pageOrder.length - 1 || !canProcess} aria-label={`Move Page ${pageIndex + 1} to end`}>Last</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tool.id === "jpg-to-pdf" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Page size</Label>
            <Select value={imagePageSize} onValueChange={(value) => setImagePageSize(value as ImagePdfPageSize)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fit">Fit image</SelectItem>
                <SelectItem value="a4-portrait">A4 portrait</SelectItem>
                <SelectItem value="a4-landscape">A4 landscape</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Margins</Label>
            <Select value={imageMargin} onValueChange={(value) => setImageMargin(value as ImagePdfMargin)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : null}

      {isPdfToImagesTool ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label>Image format</Label>
            <Select value={pdfImageFormat} onValueChange={(value) => setPdfImageFormat(value as PdfImageExportFormat)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PageRangeControls applyMode={applyMode} pageRange={pageRange} onApplyModeChange={setApplyMode} onPageRangeChange={setPageRange} />
        </div>
      ) : null}

      {isRemoveBlankPagesTool && pageOrder.length ? (
        <div className="space-y-3">
          <div className="rounded-xl border bg-muted/25 p-3 text-sm text-muted-foreground">
            Paperlane suggests likely blank pages, but nothing is removed automatically. Review the previews and confirm the pages to remove.
          </div>
          <p className="text-sm font-semibold">
            {blankPageSuggestions.length
              ? `Suggested blank pages: ${blankPageSuggestions.map((index) => `Page ${index + 1}`).join(", ")}`
              : "No likely blank pages detected. You can still choose pages manually."}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageOrder.map((pageIndex) => {
              const checked = blankPageSelections.includes(pageIndex);
              const suggested = blankPageSuggestions.includes(pageIndex);
              return (
                <div key={pageIndex} className={cn("rounded-lg border bg-card p-3", checked && "border-primary/60 bg-secondary/40")}>
                  <div className="overflow-hidden rounded-md border bg-muted/35">
                    <div className="aspect-[3/4]">
                      {pagePreviewUrls[pageIndex] ? (
                        <img className="h-full w-full object-contain" src={pagePreviewUrls[pageIndex]} alt={`Preview of page ${pageIndex + 1}`} />
                      ) : (
                        <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
                          Rendering page preview...
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-start gap-3">
                    <Checkbox
                      id={`blank-page-${pageIndex}`}
                      checked={checked}
                      onCheckedChange={(value) => toggleBlankPageSelection(pageIndex, value === true)}
                      disabled={!canProcess}
                    />
                    <div className="grid gap-1">
                      <Label htmlFor={`blank-page-${pageIndex}`}>Remove Page {pageIndex + 1}</Label>
                      <p className="text-xs text-muted-foreground">{suggested ? "Likely blank" : "Not suggested"}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {isSignatureTool ? (
        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/25 p-3 text-sm text-muted-foreground">
            This creates a visual electronic signature only. It is not digitally certified, cryptographically signed or legally verified.
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Signature source</Label>
              <Select value={signatureMode} onValueChange={(value) => setSignatureMode(value as SignatureMode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draw">Draw signature</SelectItem>
                  <SelectItem value="type">Type signature</SelectItem>
                  <SelectItem value="upload">Upload signature image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="signature-page">Page</Label>
              <Input id="signature-page" type="number" min={1} max={Math.max(pageCount, 1)} value={signaturePage} onChange={(event) => setSignaturePage(event.target.value)} />
            </div>
          </div>

          {signatureMode === "draw" ? (
            <div className="space-y-3">
              <canvas
                ref={signatureCanvasRef}
                width={700}
                height={220}
                className="h-40 w-full touch-none rounded-xl border bg-background"
                aria-label="Draw visual signature"
                onPointerDown={startSignatureStroke}
                onPointerMove={continueSignatureStroke}
                onPointerUp={endSignatureStroke}
                onPointerCancel={endSignatureStroke}
                onPointerLeave={endSignatureStroke}
              />
              <Button type="button" variant="outline" onClick={clearSignatureCanvas}>
                <Eraser className="h-4 w-4" aria-hidden="true" />
                Clear Signature
              </Button>
            </div>
          ) : null}

          {signatureMode === "type" ? (
            <div className="grid gap-2">
              <Label htmlFor="signature-text">Signature text</Label>
              <Input id="signature-text" value={signatureText} onChange={(event) => setSignatureText(event.target.value)} placeholder="Type a name" maxLength={80} />
            </div>
          ) : null}

          {signatureMode === "upload" ? (
            <div className="space-y-3">
              <input
                ref={signatureImageInputRef}
                type="file"
                className="sr-only"
                accept=".jpg,.jpeg,.png"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    try {
                      validateImageFile(file);
                      setSignatureImageFile(file);
                      resetGeneratedState();
                    } catch (signatureError) {
                      setError(toUserFacingPdfError(signatureError));
                      setStatus("error");
                    }
                  }
                  event.target.value = "";
                }}
              />
              <Button type="button" variant="outline" onClick={() => signatureImageInputRef.current?.click()}>
                <Upload className="h-4 w-4" aria-hidden="true" />
                Upload Signature Image
              </Button>
              {signatureImageFile ? (
                <p className="text-sm text-muted-foreground">
                  Selected: {signatureImageFile.name} · {formatFileSize(signatureImageFile.size)}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Placement</Label>
              <Select value={signaturePosition} onValueChange={(value) => setSignaturePosition(value as WatermarkPosition)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="centre">Centre</SelectItem>
                  <SelectItem value="top-left">Top left</SelectItem>
                  <SelectItem value="top-right">Top right</SelectItem>
                  <SelectItem value="bottom-left">Bottom left</SelectItem>
                  <SelectItem value="bottom-right">Bottom right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Signature width: {signatureWidth}%</Label>
              <Slider value={[signatureWidth]} min={12} max={60} step={1} onValueChange={([value]) => setSignatureWidth(value)} />
            </div>
          </div>
        </div>
      ) : null}

      {tool.id === "add-watermark" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="watermark-text-real">Watermark text</Label>
            <Input id="watermark-text-real" maxLength={100} value={watermarkText} onChange={(event) => setWatermarkText(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Font size: {watermarkSize}</Label>
            <Slider value={[watermarkSize]} min={12} max={96} step={1} onValueChange={([value]) => setWatermarkSize(value)} />
          </div>
          <div className="grid gap-2">
            <Label>Opacity: {watermarkOpacity.toFixed(1)}</Label>
            <Slider value={[watermarkOpacity]} min={0.1} max={1} step={0.1} onValueChange={([value]) => setWatermarkOpacity(value)} />
          </div>
          <div className="grid gap-2">
            <Label>Position</Label>
            <Select value={watermarkPosition} onValueChange={(value) => setWatermarkPosition(value as WatermarkPosition)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="centre">Centre</SelectItem>
                <SelectItem value="top-left">Top left</SelectItem>
                <SelectItem value="top-right">Top right</SelectItem>
                <SelectItem value="bottom-left">Bottom left</SelectItem>
                <SelectItem value="bottom-right">Bottom right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PageRangeControls applyMode={applyMode} pageRange={pageRange} onApplyModeChange={setApplyMode} onPageRangeChange={setPageRange} />
        </div>
      ) : null}

      <LocalProcessingStatus status={status} error={error} />
      <GeneratedOutputList outputs={outputs} onRemove={() => {
        clearOutputs();
        setStatus("idle");
      }} />

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={processTool} disabled={!canProcess}>
          <MoveHorizontal className="h-4 w-4" aria-hidden="true" />
          {primaryActionLabel}
        </Button>
        <Button type="button" variant="outline" onClick={inspectPdf} disabled={isImageTool || !files.length || !canProcess}>
          Refresh Page Info
        </Button>
        <Button type="button" variant="outline" onClick={resetWorkflow} disabled={!canProcess}>
          Reset Workflow
        </Button>
        <Button type="button" variant="outline" onClick={onChooseAnother}>
          Choose Another Tool
        </Button>
      </div>
    </div>
  );
}

function PageRangeControls({
  applyMode,
  pageRange,
  onApplyModeChange,
  onPageRangeChange,
}: {
  applyMode: "all" | "range";
  pageRange: string;
  onApplyModeChange: (mode: "all" | "range") => void;
  onPageRangeChange: (range: string) => void;
}) {
  return (
    <>
      <div className="grid gap-2">
        <Label>Apply to</Label>
        <Select value={applyMode} onValueChange={(value) => onApplyModeChange(value as "all" | "range")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All pages</SelectItem>
            <SelectItem value="range">Selected page range</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {applyMode === "range" ? (
        <div className="grid gap-2">
          <Label htmlFor="functional-page-range">Page range</Label>
          <Input id="functional-page-range" value={pageRange} onChange={(event) => onPageRangeChange(event.target.value)} placeholder="1-3,6" />
        </div>
      ) : null}
    </>
  );
}
