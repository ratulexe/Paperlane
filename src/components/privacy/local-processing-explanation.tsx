import { Cpu, Eye, ShieldAlert, UploadCloud } from "lucide-react";
import { ConceptAlert } from "@/components/shared/concept-alert";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";

const functionalPoints = [
  "Selected file bytes are read into browser memory.",
  "Processing occurs locally on the user's device.",
  "No Paperlane server receives the document.",
  "Generated output remains in browser memory until downloaded, replaced, or cleared.",
  "Browser-local processing may consume significant device memory.",
];

const conceptPoints = [
  "Only interface behaviour is demonstrated.",
  "No document processing occurs.",
  "No output file is created.",
];

const cloudPoints = [
  "A file is uploaded only after explicit user action and consent.",
  "Temporary job metadata tracks random job ID, state, timestamps, file size, preset, duration, error category and deletion state.",
  "Input and output files have configured expiration periods.",
  "Users may request immediate deletion, while server-side cleanup remains authoritative.",
  "No account history or permanent document storage is implemented.",
];

export function LocalProcessingExplanation() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading
        eyebrow="Processing models"
        title="Local, cloud and coming-soon tools are clearly separated."
        description="Paperlane distinguishes browser-local workflows from the temporary cloud-processing foundation and unavailable roadmap tools."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <Cpu className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Functional local tools</h2>
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted-foreground">
              {functionalPoints.map((point) => (
                <li key={point}>- {point}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <UploadCloud className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Temporary cloud-processing tools</h2>
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted-foreground">
              {cloudPoints.map((point) => (
                <li key={point}>- {point}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Eye className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Coming-soon tools</h2>
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted-foreground">
              {conceptPoints.map((point) => (
                <li key={point}>- {point}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <ConceptAlert
        className="mt-5"
        icon={ShieldAlert}
        description="Browser-local processing reduces server exposure, but it does not guarantee complete security. Avoid processing highly sensitive documents on untrusted, compromised, public, or shared devices."
      />
    </section>
  );
}
