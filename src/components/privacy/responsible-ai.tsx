import { AlertTriangle } from "lucide-react";
import { ConceptAlert } from "@/components/shared/concept-alert";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { aiCautions } from "@/data/privacy";

export function ResponsibleAi() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading eyebrow="Responsible AI" title="AI should assist, not quietly decide." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {aiCautions.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardContent className="p-5">
                <Icon className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="text-sm font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <ConceptAlert
        className="mt-6"
        icon={AlertTriangle}
        description="Do not rely on AI-generated document output for legal, medical, financial or other high-stakes decisions without qualified human review."
      />
    </section>
  );
}
