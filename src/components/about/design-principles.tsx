import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { designPrinciples } from "@/data/about";

export function DesignPrinciples() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading eyebrow="Design principles" title="The ideas guiding Paperlane." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {designPrinciples.map((principle) => {
          const Icon = principle.icon;
          return (
            <Card key={principle.title}>
              <CardContent className="p-5">
                <Icon className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="font-semibold text-foreground">{principle.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{principle.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
