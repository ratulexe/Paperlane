import { SectionHeading } from "@/components/shared/section-heading";
import { benefits } from "@/data/homepage";

export function BenefitsSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading title="Built around clarity, not complexity." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <article key={benefit.title} className="rounded-xl border bg-card p-4">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="mt-4 text-base font-semibold text-foreground">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{benefit.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
