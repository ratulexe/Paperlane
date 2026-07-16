import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { popularTools } from "@/data/tools";

export function PopularToolsSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading
        eyebrow="Popular workflows"
        title="Useful tools, without the clutter."
        description="Start with a familiar document task and follow a clear, consistent workflow."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {popularTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.name}
              className="group transition-colors hover:border-primary/40 hover:shadow-sm focus-within:border-primary/50"
            >
              <CardContent className="flex h-full flex-col p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Badge variant="secondary">{tool.category}</Badge>
                    {tool.popular ? <Badge>Popular</Badge> : null}
                    {tool.ai ? <Badge variant="outline">AI</Badge> : null}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{tool.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{tool.description}</p>
                <Link
                  to="/tools"
                  className="mt-5 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-primary outline-none transition-colors hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Open workflow
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
