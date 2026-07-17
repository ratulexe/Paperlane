import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadGeneratedOutput, sanitizeFilename } from "@/lib/pdf/download-file";
import { formatFileSize } from "@/lib/file-demo";
import type { GeneratedOutput } from "@/types/processing";

function getDownloadFilename(output: GeneratedOutput, filename: string) {
  const sanitized = sanitizeFilename(filename || output.filename);
  return sanitized.toLowerCase().endsWith(".pdf") ? sanitized : `${sanitized}.pdf`;
}

function getDownloadButtonLabel(output: GeneratedOutput) {
  const filename = output.filename.toLowerCase();
  const pageNumber = filename.match(/paperlane-page-(\d+)\.pdf/)?.[1];

  if (filename.includes("merged")) return "Download Merged PDF";
  if (filename.includes("selected-pages")) return "Download Selected Pages";
  if (pageNumber) return `Download Page ${pageNumber}`;
  if (filename.includes("rotated")) return "Download Rotated PDF";
  if (filename.includes("reordered")) return "Download Reordered PDF";
  if (filename.includes("images")) return "Download Image PDF";
  if (filename.includes("watermarked")) return "Download Watermarked PDF";

  return "Download PDF";
}

export function GeneratedOutputList({
  outputs,
  onRemove,
}: {
  outputs: GeneratedOutput[];
  onRemove: () => void;
}) {
  const [downloadNames, setDownloadNames] = useState<Record<string, string>>({});

  if (!outputs.length) return null;

  return (
    <Card className="border-primary/20 bg-secondary/35 shadow-none">
      <CardContent className="space-y-3 p-4">
        <div>
          <h3 className="text-sm font-semibold">Generated output</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Processing completed locally in your browser. Your file was not uploaded to a Paperlane server.
          </p>
        </div>
        <div className="grid gap-2">
          {outputs.map((output, index) => {
            const downloadName = downloadNames[output.objectUrl] ?? output.filename;
            const finalFilename = getDownloadFilename(output, downloadName);

            return (
              <div key={output.objectUrl} className="grid gap-3 rounded-lg border bg-card p-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="min-w-0">
                  <div className="grid gap-2">
                    <Label htmlFor={`download-name-${index}`}>Rename download</Label>
                    <Input
                      id={`download-name-${index}`}
                      value={downloadName}
                      onChange={(event) =>
                        setDownloadNames((current) => ({
                          ...current,
                          [output.objectUrl]: event.target.value,
                        }))
                      }
                      placeholder={output.filename}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Original: {output.filename} · {formatFileSize(output.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => downloadGeneratedOutput({ ...output, filename: finalFilename })}
                  aria-label={`Download ${finalFilename}`}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {getDownloadButtonLabel(output)}
                </Button>
              </div>
            );
          })}
        </div>
        <Button type="button" variant="outline" onClick={onRemove}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Remove Output
        </Button>
      </CardContent>
    </Card>
  );
}
