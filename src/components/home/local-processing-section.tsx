import { Download, FileCheck2, MonitorCog, ShieldAlert } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

const localProcessingSteps = [
  {
    title: "Select locally",
    description: "Choose a supported file from your device.",
    icon: FileCheck2,
  },
  {
    title: "Process in browser",
    description: "The selected operation runs locally using browser memory.",
    icon: MonitorCog,
  },
  {
    title: "Download the result",
    description: "Save the generated output, then clear it from the interface.",
    icon: Download,
  },
];

export function LocalProcessingSection() {
  return (
    <section id="local-processing" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-10 sm:px-6 md:py-14">
      <SectionHeading
        eyebrow="Browser-local processing"
        title="Your file stays on your device for supported tools."
        description="Paperlane's functional tools read and process selected file bytes in browser memory. The documents are not uploaded to a Paperlane server."
        className="mb-6"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {localProcessingSteps.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.title} className="shadow-none">
              <CardContent className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Alert className="mt-5">
        <ShieldAlert className="h-4 w-4" aria-hidden="true" />
        <AlertDescription>
          Browser-local processing reduces server exposure, but it does not guarantee complete device security. Avoid
          highly sensitive documents on public, shared, untrusted or compromised devices.
        </AlertDescription>
      </Alert>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Card className="border-primary/20 bg-secondary/35 shadow-none">
          <CardContent className="p-5">
            <h3 className="text-base font-semibold text-foreground">Local-processing tools</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Create genuine output files in the browser.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-5">
            <h3 className="text-base font-semibold text-foreground">Concept-preview tools</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Demonstrate interface behaviour without processing or output creation.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
