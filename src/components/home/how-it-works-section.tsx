import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { processSteps } from "@/data/homepage";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading eyebrow="How it works" title="A clear path from file to finished workflow." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {processSteps.map((step) => (
          <Card key={step.number} className="shadow-none">
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
    </section>
  );
}
