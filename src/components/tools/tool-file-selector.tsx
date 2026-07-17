import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { ArrowDown, ArrowUp, File, FilePlus2, X } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  acceptedTypeActionLabel,
  acceptedTypeAttribute,
  acceptedTypeSummary,
  createDemoFile,
  formatFileSize,
  getFileExtension,
  validateDemoFile,
} from "@/lib/file-demo";
import { cn } from "@/lib/utils";
import type { AcceptedFileType, SelectedDemoFile } from "@/types/tool";

type ToolFileSelectorProps = {
  acceptedFileTypes: AcceptedFileType[];
  files: SelectedDemoFile[];
  onFilesChange: (files: SelectedDemoFile[]) => void;
  allowMultiple?: boolean;
  maxFiles?: number;
};

export function ToolFileSelector({
  acceptedFileTypes,
  files,
  onFilesChange,
  allowMultiple = false,
  maxFiles = 1,
}: ToolFileSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const acceptSummary = acceptedTypeSummary(acceptedFileTypes);
  const acceptAttribute = acceptedTypeAttribute(acceptedFileTypes);
  const actionLabel = acceptedTypeActionLabel(acceptedFileTypes);

  const addFiles = (incomingFiles: FileList | File[]) => {
    const incoming = Array.from(incomingFiles);
    const nextFiles = allowMultiple ? [...files] : [];

    for (const file of incoming) {
      const validationError = validateDemoFile(file, acceptedFileTypes);
      if (validationError) {
        setError(validationError);
        toast.warning(validationError);
        return;
      }
      if (nextFiles.length >= maxFiles) {
        const limitMessage = `Add up to ${maxFiles} files for this demonstration.`;
        setError(limitMessage);
        toast.warning(limitMessage);
        return;
      }
      nextFiles.push(createDemoFile(file));
      if (!allowMultiple) break;
    }

    setError("");
    onFilesChange(nextFiles);
  };

  const removeFile = (fileId: string) => {
    onFilesChange(files.filter((item) => item.id !== fileId));
  };

  const moveFile = (fileId: string, direction: "up" | "down") => {
    const index = files.findIndex((item) => item.id === fileId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= files.length) return;
    const nextFiles = [...files];
    [nextFiles[index], nextFiles[targetIndex]] = [nextFiles[targetIndex], nextFiles[index]];
    onFilesChange(nextFiles);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLLabelElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        multiple={allowMultiple}
        accept={acceptAttribute}
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <label
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isDragging ? "border-primary bg-secondary" : "border-border bg-muted/35 hover:bg-muted/55",
        )}
      >
        <FilePlus2 className="h-8 w-8 text-primary" aria-hidden="true" />
        <strong className="mt-3 text-base font-semibold">Drag a file here or browse</strong>
        <span className="mt-1 text-sm text-muted-foreground">Accepted: {acceptSummary}</span>
        <span className="mt-4 rounded-md border bg-background px-3 py-1.5 text-sm font-medium">
          Drop or press Enter
        </span>
      </label>

      <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
        {actionLabel}
      </Button>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {files.length ? (
        <div className="space-y-2">
          {files.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                <File className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {getFileExtension(item.file.name).toUpperCase() || item.file.type || "File"} · {formatFileSize(item.file.size)}
                </p>
              </div>
              <Badge>Ready</Badge>
              {allowMultiple ? (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => moveFile(item.id, "up")} disabled={index === 0} aria-label={`Move ${item.file.name} up`}>
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => moveFile(item.id, "down")} disabled={index === files.length - 1} aria-label={`Move ${item.file.name} down`}>
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              ) : null}
              <Button variant="ghost" size="icon" onClick={() => removeFile(item.id)} aria-label={`Remove ${item.file.name}`}>
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
