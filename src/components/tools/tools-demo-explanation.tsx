import { AlertCircle, FileCheck2, MousePointer2, Settings2 } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

const demoSteps = [
  {
    title: "Select locally",
    description: "The browser only displays basic file details such as name, type and size.",
    icon: FileCheck2,
  },
  {
    title: "Configure the workflow",
    description: "Choose example options for the selected document action.",
    icon: Settings2,
  },
  {
    title: "Simulate the interaction",
    description: "See interface progress without real upload, conversion or processing.",
    icon: MousePointer2,
  },
];

export function ToolsDemoExplanation() {
  return (
    <section id="demo-explanation" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading
        eyebrow="Frontend demonstration"
        title="Explore the workflow without sending a document anywhere."
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
          A production document platform would require carefully designed processing, storage, security, retention and
          privacy systems. Those systems are not included in this project.
        </AlertDescription>
      </Alert>
    </section>
  );
}
