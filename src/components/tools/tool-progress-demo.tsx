import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

type ToolProgressDemoProps = {
  progress: number;
  status: string;
  completed: boolean;
};

export function ToolProgressDemo({ progress, status, completed }: ToolProgressDemoProps) {
  if (!status) return null;

  return (
    <div className="space-y-3" aria-live="polite">
      <Progress value={progress} />
      <p className="text-sm text-muted-foreground">{status}</p>
      {completed ? (
        <Alert>
          <AlertDescription>
            Concept preview completed. No document processing or output file was created.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
