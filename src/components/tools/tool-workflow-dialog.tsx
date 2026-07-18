import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Bot, CheckCircle2 } from "lucide-react";
import { FunctionalToolWorkflow } from "@/components/tools/functional-tool-workflow";
import { toast } from "sonner";
import { ToolFileSelector } from "@/components/tools/tool-file-selector";
import { ToolProgressDemo } from "@/components/tools/tool-progress-demo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categoryLabels } from "@/data/tools";
import type { DemoConfig, DemoOptionValue, DocumentTool, SelectedDemoFile } from "@/types/tool";

type ToolWorkflowDialogProps = {
  tool: DocumentTool | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const pageTiles = ["Page 1", "Page 2", "Page 3", "Page 4"];

function initialConfig(tool: DocumentTool | null): DemoConfig {
  if (!tool) return {};
  const outputFormat =
    tool.id === "pdf-to-jpg" ? "JPG" : tool.id === "pdf-to-word" ? "DOCX" : tool.id === "word-to-pdf" || tool.id === "jpg-to-pdf" ? "PDF" : "";

  return {
    splitOption: "Extract every page",
    pageRange: "1-3",
    rotation: "90° clockwise",
    pageOrder: pageTiles,
    outputFormat,
    compression: "Balanced",
    reviewBlankPages: true,
    language: "English",
    summaryLength: "Standard",
    sourceLanguage: "Auto detect",
    targetLanguage: "English",
    extractionFields: ["Names", "Dates"],
    protectPassword: "",
    confirmPassword: "",
    unlockPassword: "",
    watermarkText: "Confidential",
    watermarkPosition: "Centre",
    signerName: "",
    signaturePlacement: "Last page",
  };
}

function displayValue(value: DemoOptionValue | undefined, key: string) {
  if (key.toLowerCase().includes("password")) return value ? "Password entered" : "Not entered";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Enabled" : "Disabled";
  return value || "Not selected";
}

function ConfigSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ToolConfiguration({
  tool,
  config,
  updateConfig,
}: {
  tool: DocumentTool;
  config: DemoConfig;
  updateConfig: (key: string, value: DemoOptionValue) => void;
}) {
  const getString = (key: string) => String(config[key] ?? "");
  const getArray = (key: string) => (Array.isArray(config[key]) ? (config[key] as string[]) : []);

  const movePage = (page: string, direction: "left" | "right") => {
    const order = getArray("pageOrder");
    const index = order.indexOf(page);
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= order.length) return;
    const next = [...order];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    updateConfig("pageOrder", next);
  };

  if (tool.configKind === "merge") {
    return <p className="text-sm text-muted-foreground">Add up to five local demonstration files, then use Up and Down controls to preview ordering.</p>;
  }

  if (tool.configKind === "split") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <ConfigSelect id="split-option" label="Demo split option" value={getString("splitOption")} options={["Extract every page", "Select page range"]} onChange={(value) => updateConfig("splitOption", value)} />
        <div className="grid gap-2">
          <Label htmlFor="page-range">Page range workflow input</Label>
          <Input id="page-range" value={getString("pageRange")} onChange={(event) => updateConfig("pageRange", event.target.value)} />
        </div>
      </div>
    );
  }

  if (tool.configKind === "rotate") {
    return <ConfigSelect id="rotation" label="Rotation" value={getString("rotation")} options={["90° clockwise", "90° counter-clockwise", "180°"]} onChange={(value) => updateConfig("rotation", value)} />;
  }

  if (tool.configKind === "reorder") {
    return (
      <div className="grid gap-3">
        <p className="text-sm text-muted-foreground">Example page labels are generated for the interface demo.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {getArray("pageOrder").map((page) => (
            <div key={page} className="flex items-center justify-between gap-2 rounded-lg border bg-card p-3">
              <span className="text-sm font-medium">{page}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => movePage(page, "left")}>Left</Button>
                <Button variant="outline" size="sm" onClick={() => movePage(page, "right")}>Right</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tool.configKind === "output-format") {
    const options = tool.id === "pdf-to-jpg" ? ["JPG", "PNG"] : [getString("outputFormat") || "PDF"];
    return <ConfigSelect id="output-format" label="Output format" value={getString("outputFormat")} options={options} onChange={(value) => updateConfig("outputFormat", value)} />;
  }

  if (tool.configKind === "compress") {
    return <ConfigSelect id="compression" label="Compression preference" value={getString("compression")} options={["Balanced", "Smaller file", "Higher clarity"]} onChange={(value) => updateConfig("compression", value)} />;
  }

  if (tool.configKind === "blank-pages") {
    return (
      <label className="flex items-start gap-3 rounded-lg border bg-card p-3 text-sm">
        <input type="checkbox" checked={Boolean(config.reviewBlankPages)} onChange={(event) => updateConfig("reviewBlankPages", event.target.checked)} className="mt-1 accent-primary" />
        <span>Review possible blank pages before removal</span>
      </label>
    );
  }

  if (tool.configKind === "repair") {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        <AlertDescription>A production repair workflow would inspect document structure.</AlertDescription>
      </Alert>
    );
  }

  if (tool.configKind === "ocr") {
    return (
      <div className="space-y-3">
        <ConfigSelect id="ocr-language" label="Language" value={getString("language")} options={["English", "Spanish", "French", "German"]} onChange={(value) => updateConfig("language", value)} />
        <p className="text-sm text-muted-foreground">AI output would require human review in a production version.</p>
      </div>
    );
  }

  if (tool.configKind === "summary") {
    return (
      <div className="space-y-3">
        <ConfigSelect id="summary-length" label="Summary length" value={getString("summaryLength")} options={["Brief", "Standard", "Detailed"]} onChange={(value) => updateConfig("summaryLength", value)} />
        <p className="text-sm text-muted-foreground">AI output would require human review in a production version.</p>
      </div>
    );
  }

  if (tool.configKind === "translation") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <ConfigSelect id="source-language" label="Source language" value={getString("sourceLanguage")} options={["Auto detect", "English", "Spanish", "French"]} onChange={(value) => updateConfig("sourceLanguage", value)} />
        <ConfigSelect id="target-language" label="Target language" value={getString("targetLanguage")} options={["English", "Spanish", "French", "German"]} onChange={(value) => updateConfig("targetLanguage", value)} />
        <p className="text-sm text-muted-foreground sm:col-span-2">AI output would require human review in a production version.</p>
      </div>
    );
  }

  if (tool.configKind === "extract") {
    const fields = getArray("extractionFields");
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {["Names", "Dates", "Amounts", "Contact details"].map((field) => (
          <label key={field} className="flex items-center gap-3 rounded-lg border bg-card p-3 text-sm">
            <input
              type="checkbox"
              checked={fields.includes(field)}
              onChange={(event) => {
                updateConfig("extractionFields", event.target.checked ? [...fields, field] : fields.filter((item) => item !== field));
              }}
              className="accent-primary"
            />
            {field}
          </label>
        ))}
        <p className="text-sm text-muted-foreground sm:col-span-2">AI output would require human review in a production version.</p>
      </div>
    );
  }

  if (tool.configKind === "protect") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="protect-password">Demo password</Label>
          <Input id="protect-password" type="password" value={getString("protectPassword")} onChange={(event) => updateConfig("protectPassword", event.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input id="confirm-password" type="password" value={getString("confirmPassword")} onChange={(event) => updateConfig("confirmPassword", event.target.value)} />
        </div>
      </div>
    );
  }

  if (tool.configKind === "unlock") {
    return (
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="unlock-password">Demo password</Label>
          <Input id="unlock-password" type="password" value={getString("unlockPassword")} onChange={(event) => updateConfig("unlockPassword", event.target.value)} />
        </div>
        <Alert>
          <AlertDescription>Users should only unlock documents they are authorised to modify.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (tool.configKind === "watermark") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="watermark-text">Watermark text</Label>
          <Input id="watermark-text" value={getString("watermarkText")} onChange={(event) => updateConfig("watermarkText", event.target.value)} />
        </div>
        <ConfigSelect id="watermark-position" label="Position" value={getString("watermarkPosition")} options={["Centre", "Top right", "Bottom right"]} onChange={(value) => updateConfig("watermarkPosition", value)} />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="signer-name">Signer name</Label>
        <Input id="signer-name" value={getString("signerName")} onChange={(event) => updateConfig("signerName", event.target.value)} />
      </div>
      <ConfigSelect id="signature-placement" label="Placement" value={getString("signaturePlacement")} options={["First page", "Last page", "Every page"]} onChange={(value) => updateConfig("signaturePlacement", value)} />
      <p className="text-sm text-muted-foreground sm:col-span-2">This demo does not capture real signatures.</p>
    </div>
  );
}

export function ToolWorkflowDialog({ tool, open, onOpenChange }: ToolWorkflowDialogProps) {
  const [activeStep, setActiveStep] = useState("select");
  const [files, setFiles] = useState<SelectedDemoFile[]>([]);
  const [config, setConfig] = useState<DemoConfig>(() => initialConfig(tool));
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [completed, setCompleted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const resetState = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setActiveStep("select");
    setFiles([]);
    setConfig(initialConfig(tool));
    setProgress(0);
    setProgressStatus("");
    setCompleted(false);
    setIsRunning(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const allowMultiple = tool?.configKind === "merge" || tool?.id === "jpg-to-pdf";
  const canStart = useMemo(() => {
    if (!tool || !files.length) return false;
    if (tool.configKind === "protect") return Boolean(config.protectPassword) && config.protectPassword === config.confirmPassword;
    if (tool.configKind === "unlock") return Boolean(config.unlockPassword);
    return true;
  }, [config, files.length, tool]);

  if (!tool) return null;
  const Icon = tool.icon;
  const badges = tool.badges.filter((badge) => badge !== "none");
  const isFunctional = tool.implementationStatus === "functional-local";

  const updateConfig = (key: string, value: DemoOptionValue) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };

  const startDemo = () => {
    if (!canStart) {
      toast.warning("Select a valid file and complete the required demonstration inputs.");
      return;
    }
    if (timerRef.current) window.clearInterval(timerRef.current);
    setProgress(0);
    setProgressStatus("Preparing demonstration");
    setCompleted(false);
    setIsRunning(true);

    timerRef.current = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + 8, 100);
        if (next < 25) setProgressStatus("Preparing demonstration");
        else if (next < 55) setProgressStatus("Reviewing selected options");
        else if (next < 85) setProgressStatus("Simulating workflow");
        else if (next < 100) setProgressStatus("Completing demonstration");
        else {
          if (timerRef.current) window.clearInterval(timerRef.current);
          timerRef.current = null;
          setIsRunning(false);
          setCompleted(true);
          setProgressStatus("Coming-soon preview completed. No document processing or output file was created.");
        }
        return next;
      });
    }, 180);
  };

  const runAgain = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setProgress(0);
    setProgressStatus("");
    setCompleted(false);
    setIsRunning(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetState();
    onOpenChange(nextOpen);
  };

  const summaryEntries = Object.entries(config).filter(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "boolean") return true;
    if (key.includes("Password")) return Boolean(value);
    return Boolean(value);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-hidden p-0 sm:max-w-3xl">
        <ScrollArea className="max-h-[calc(92vh-1rem)]">
          <div className="p-5 sm:p-6">
            <DialogHeader className="pr-8">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <Badge variant="secondary">{categoryLabels[tool.category]}</Badge>
                {badges.map((badge) => (
                  <Badge key={badge} variant={badge === "ai" ? "outline" : "default"}>
                    {badge === "ai" ? "AI" : badge[0].toUpperCase() + badge.slice(1)}
                  </Badge>
                ))}
              </div>
              <DialogTitle className="text-2xl">{tool.name}</DialogTitle>
              <DialogDescription>{tool.detailedDescription}</DialogDescription>
            </DialogHeader>

            <Alert className="mt-5">
              <AlertDescription>
                {isFunctional
                  ? "Your document is processed locally in this browser. It is not uploaded to a Paperlane server."
                  : "This workflow demonstrates the intended interface only. No document processing or output file creation occurs."}
              </AlertDescription>
            </Alert>

            {isFunctional ? (
              <div className="mt-5">
                <FunctionalToolWorkflow tool={tool} onChooseAnother={() => handleOpenChange(false)} />
              </div>
            ) : (
            <Tabs value={activeStep} onValueChange={setActiveStep} className="mt-5">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="select">1. Select</TabsTrigger>
                <TabsTrigger value="configure">2. Configure</TabsTrigger>
                <TabsTrigger value="simulate">3. Simulate</TabsTrigger>
              </TabsList>

              <TabsContent value="select" className="mt-5 space-y-4">
                <ToolFileSelector
                  acceptedFileTypes={tool.acceptedFileTypes}
                  files={files}
                  onFilesChange={setFiles}
                  allowMultiple={allowMultiple}
                  maxFiles={tool.configKind === "merge" ? 5 : 8}
                />
                <Button variant="outline" onClick={() => setActiveStep("configure")} disabled={!files.length}>
                  Continue to Configure
                </Button>
              </TabsContent>

              <TabsContent value="configure" className="mt-5 space-y-4">
                <ToolConfiguration tool={tool} config={config} updateConfig={updateConfig} />
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => setActiveStep("select")}>Back</Button>
                  <Button onClick={() => setActiveStep("simulate")}>Review Simulation</Button>
                </div>
              </TabsContent>

              <TabsContent value="simulate" className="mt-5 space-y-4">
                <Card className="shadow-none">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                      Review summary
                    </div>
                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">Selected tool</dt>
                        <dd className="font-medium">{tool.name}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Selected file or files</dt>
                        <dd className="truncate font-medium">{files.map((item) => item.file.name).join(", ") || "No file selected"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Current step</dt>
                        <dd className="font-medium">Simulate</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Notice</dt>
                        <dd className="font-medium">Coming soon</dd>
                      </div>
                    </dl>
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="mb-2 text-sm font-semibold">Selected configuration</p>
                      <ul className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                        {summaryEntries
                          .sort(([leftKey], [rightKey]) => Number(rightKey.toLowerCase().includes("password")) - Number(leftKey.toLowerCase().includes("password")))
                          .map(([key, value]) => (
                          <li key={key} className="truncate">
                            <span className="font-medium text-foreground">{key.replace(/([A-Z])/g, " $1")}: </span>
                            {displayValue(value, key)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                <ToolProgressDemo progress={progress} status={progressStatus} completed={completed} />
              </TabsContent>
            </Tabs>
            )}
          </div>

          {!isFunctional ? (
          <DialogFooter className="sticky bottom-0 border-t bg-background p-4">
            <DialogClose asChild>
              <Button variant="outline" onClick={() => resetState()}>
                Choose Another Tool
              </Button>
            </DialogClose>
            <Button variant="secondary" onClick={runAgain} disabled={!progressStatus || isRunning}>
              Run Again
            </Button>
            <Button onClick={startDemo} disabled={!canStart || isRunning}>
              <Bot className="mr-2 h-4 w-4" aria-hidden="true" />
              Start Demo
            </Button>
          </DialogFooter>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
