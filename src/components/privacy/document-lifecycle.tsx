import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { lifecycleStages } from "@/data/privacy";

export function DocumentLifecycle() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading eyebrow="Intended product workflow" title="A transparent document journey." className="mb-0" />
        <Badge variant="secondary" className="w-fit">
          Concept workflow
        </Badge>
      </div>
      <ol className="grid gap-3 lg:grid-cols-5">
        {lifecycleStages.map((stage, index) => (
          <li key={stage}>
            <Card className="h-full">
              <CardContent className="p-4">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Stage {index + 1}</span>
                <h2 className="mt-3 text-sm font-semibold leading-6">{stage}</h2>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        These stages describe intended product-design principles, not implemented backend functionality.
      </p>
    </section>
  );
}
