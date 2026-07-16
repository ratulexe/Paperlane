import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { documentProblems } from "@/data/about";

export function DocumentProblems() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading
        eyebrow="The problem"
        title="Document work is often more complicated than it needs to be."
        description="Simple tasks frequently require several websites, unfamiliar interfaces and unclear file-handling decisions."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {documentProblems.map((problem) => {
          const Icon = problem.icon;
          return (
            <Card key={problem.title} className="shadow-xs">
              <CardContent className="p-5">
                <Icon className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="text-base font-semibold text-foreground">{problem.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{problem.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
