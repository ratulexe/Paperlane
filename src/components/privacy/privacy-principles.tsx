import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { privacyPrinciples } from "@/data/privacy";

export function PrivacyPrinciples() {
  return (
    <section id="privacy-principles" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading eyebrow="Core principles" title="A clearer approach to document interactions." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {privacyPrinciples.map((principle) => {
          const Icon = principle.icon;
          return (
            <Card key={principle.title}>
              <CardContent className="p-5">
                <Icon className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="text-base font-semibold text-foreground">{principle.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{principle.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
