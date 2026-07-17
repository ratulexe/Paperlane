import { useEffect, useRef, useState, type DragEvent } from "react";
import {
  Bot,
  File,
  FileText,
  FileUp,
  MoreHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { aiActions, recentDocuments } from "@/data/homepage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const acceptedTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];

type DemoFile = {
  name: string;
  size: number;
  type: string;
};

function formatFileSize(bytes: number) {
  if (!bytes) return "0 KB";
  const units = ["bytes", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** index;
  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function isAcceptedFile(file: File) {
  const name = file.name.toLowerCase();
  return acceptedTypes.some((extension) => name.endsWith(extension));
}

function RecentDocumentRow({ document }: { document: (typeof recentDocuments)[number] }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
        <FileText className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{document.fileName}</p>
        <p className="text-xs text-muted-foreground">Last action: {document.lastAction}</p>
      </div>
      <Badge variant={document.status === "Ready" ? "default" : "secondary"}>{document.status}</Badge>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`More options for ${document.fileName}`}>
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {["View details", "Repeat workflow", "Remove from demo list"].map((action) => (
            <DropdownMenuItem
              key={action}
              onClick={() => toast.message(`${action} is a frontend demo action.`)}
            >
              {action}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function WorkspacePreview() {
  const inputRef = useRef<HTMLInputElement>(null);
  const progressTimer = useRef<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<DemoFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

  useEffect(() => {
    return () => {
      if (progressTimer.current) window.clearInterval(progressTimer.current);
    };
  }, []);

  const clearTimer = () => {
    if (progressTimer.current) {
      window.clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  const setFile = (file?: File) => {
    if (!file) return;
    if (!isAcceptedFile(file)) {
      toast.error("Choose a PDF, DOC, DOCX, JPG, JPEG or PNG file for this demo.");
      return;
    }
    clearTimer();
    setSelectedFile({ name: file.name, size: file.size, type: file.type });
    setProgress(0);
    setProgressLabel("");
    setIsSimulating(false);
    toast.success("File selected for the frontend demo.");
  };

  const resetFile = () => {
    clearTimer();
    setSelectedFile(null);
    setProgress(0);
    setProgressLabel("");
    setIsSimulating(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const simulateWorkflow = () => {
    if (!selectedFile) {
      toast.warning("Select a file before starting the demonstration.");
      inputRef.current?.focus();
      return;
    }

    clearTimer();
    setProgress(0);
    setProgressLabel("Preparing demonstration");
    setIsSimulating(true);

    progressTimer.current = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + 10, 100);
        if (next < 40) setProgressLabel("Preparing demonstration");
        else if (next < 80) setProgressLabel("Reviewing workflow");
        else if (next < 100) setProgressLabel("Completing demonstration");
        else {
          clearTimer();
          setIsSimulating(false);
          setProgressLabel("Demo completed. No document processing occurred.");
          toast.success("Demo completed. No document processing occurred.");
        }
        return next;
      });
    }, 170);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    setFile(event.dataTransfer.files[0]);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-lg">Document Workspace</CardTitle>
            <p className="text-sm text-muted-foreground">Choose a file and explore a workflow</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="whitespace-normal text-center">Workspace Preview</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Quick action menu">
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.message("Workspace details are demo-only.")}>
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.message("Workflow repeat is a frontend concept.")}>
                Repeat workflow
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" onClick={() => setActiveTab("upload")}>Upload</TabsTrigger>
            <TabsTrigger value="recent" onClick={() => setActiveTab("recent")}>Recent</TabsTrigger>
            <TabsTrigger value="ai" onClick={() => setActiveTab("ai")}>AI Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4 space-y-4">
            <input
              ref={inputRef}
              id="homepage-demo-file"
              className="sr-only"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
              onChange={(event) => setFile(event.target.files?.[0])}
            />
            <label
              htmlFor="homepage-demo-file"
              tabIndex={0}
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
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  inputRef.current?.click();
                }
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isDragging ? "border-primary bg-secondary/80" : "border-border bg-muted/35 hover:bg-muted/55",
              )}
            >
              <FileUp className="h-8 w-8 text-primary" aria-hidden="true" />
              <strong className="mt-3 text-base font-semibold">Drop a document here</strong>
              <span className="mt-1 text-sm text-muted-foreground">PDF, DOCX, JPG or PNG</span>
              <Button asChild variant="outline" size="sm" className="mt-4 pointer-events-none">
                <span>Select File</span>
              </Button>
            </label>

            <Alert className="bg-card">
              <AlertDescription>
                Supported tools process files locally in your browser. Other workflows remain clearly labelled concept previews.
              </AlertDescription>
            </Alert>

            {selectedFile ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                    <File className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Badge>Ready</Badge>
                  <Button variant="ghost" size="icon" onClick={resetFile} aria-label="Remove selected file">
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
                {progressLabel ? (
                  <div className="space-y-2" aria-live="polite">
                    <Progress value={progress} />
                    <p className="text-sm text-muted-foreground">{progressLabel}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <Button className="w-full sm:w-auto" onClick={simulateWorkflow} disabled={isSimulating}>
              Simulate Workflow
            </Button>
          </TabsContent>

          <TabsContent value="recent" className="mt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Example workspace data
            </p>
            {recentDocuments.map((document) => (
              <RecentDocumentRow key={document.fileName} document={document} />
            ))}
          </TabsContent>

          <TabsContent value="ai" className="mt-4 grid gap-3">
            {aiActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card key={action.title} className="shadow-none">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground">{action.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => toast.message("This is a frontend concept. No AI processing is performed.")}
                      >
                        <Bot className="mr-2 h-4 w-4" aria-hidden="true" />
                        Preview Workflow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
