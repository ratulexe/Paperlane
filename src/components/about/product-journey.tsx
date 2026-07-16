import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { productJourney } from "@/data/about";

export function ProductJourney() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading eyebrow="Product journey" title="From an everyday frustration to a clearer interface." />
      <ol className="relative grid gap-4 lg:grid-cols-4">
        <span className="absolute left-0 right-0 top-10 hidden h-px bg-border lg:block" aria-hidden="true" />
        {productJourney.map((stage) => (
          <li key={stage.number} className="relative">
            <Card className="h-full bg-card">
              <CardContent className="p-5">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary">
                  {stage.number}
                </span>
                <h3 className="font-semibold text-foreground">{stage.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{stage.description}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  );
}
