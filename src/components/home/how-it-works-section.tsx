import { SectionHeading } from "@/components/shared/section-heading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { processSteps } from "@/data/homepage";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading eyebrow="How it works" title="A clear path from file to finished workflow." />
      <div className="relative grid gap-4 md:grid-cols-3">
        <div className="absolute left-8 right-8 top-12 hidden h-px bg-border md:block" aria-hidden="true" />
        {processSteps.map((step) => (
          <Card key={step.number} className="relative shadow-none">
            <CardContent className="p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                {step.number}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Alert className="mt-5">
        <AlertDescription>Paperlane currently demonstrates interface behaviour only.</AlertDescription>
      </Alert>
    </section>
  );
}
