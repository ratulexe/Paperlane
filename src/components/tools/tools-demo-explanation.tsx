import { AlertCircle, FileCheck2, MousePointer2, Settings2 } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

const demoSteps = [
  {
    title: "Select locally",
    description: "Choose files in the browser. Functional tools read file bytes locally; concept previews show file details only.",
    icon: FileCheck2,
  },
  {
    title: "Configure the workflow",
    description: "Choose example options for the selected document action.",
    icon: Settings2,
  },
  {
    title: "Run or preview",
    description: "Use local output generation where supported, or review a concept interaction with no output file.",
    icon: MousePointer2,
  },
];

export function ToolsDemoExplanation() {
  return (
    <section id="demo-explanation" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading
        eyebrow="Workflow model"
        title="Local tools and concept previews stay visibly separate."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {demoSteps.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.title} className="shadow-none">
              <CardContent className="p-5">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Alert className="mt-5">
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        <AlertDescription>
          The six supported tools run in browser memory. A production document platform would still require broader
          security, privacy, retention, infrastructure and legal review.
        </AlertDescription>
      </Alert>
    </section>
  );
}
