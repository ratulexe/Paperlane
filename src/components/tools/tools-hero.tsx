import { ArrowDown, CircleDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { categoryLabels, categoryOverview, tools } from "@/data/tools";

type ToolsHeroProps = {
  onBrowseTools: () => void;
  onShowDemo: () => void;
};

export function ToolsHero({ onBrowseTools, onShowDemo }: ToolsHeroProps) {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 md:py-18 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
      <div>
        <Badge variant="secondary" className="mb-5">
          Document toolkit
        </Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Everything your documents need, in one lane.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Explore a consistent collection of document workflows, including nine browser-local tools and clearly
          labelled coming-soon workflows.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button onClick={onBrowseTools}>
            Browse Tools
            <ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="outline" onClick={onShowDemo}>
            How the Demo Works
          </Button>
        </div>
        <Alert className="mt-6 max-w-2xl">
          <AlertDescription>
            Functional tools process selected files in your browser and do not upload them to a Paperlane server.
            Coming-soon tools do not create output files.
          </AlertDescription>
        </Alert>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">19 document workflows</p>
              <p className="text-sm text-muted-foreground">9 local tools, 10 coming-soon tools</p>
            </div>
            <Badge>{tools.length} tools</Badge>
          </div>
          <div className="grid gap-3">
            {categoryOverview.map((item) => {
              const Icon = item.icon;
              const count = tools.filter((tool) => tool.category === item.category).length;
              return (
                <div key={item.category} className="flex items-center gap-3 rounded-lg border bg-muted/25 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background text-primary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{categoryLabels[item.category]}</p>
                    <p className="text-xs text-muted-foreground">{count} tools</p>
                  </div>
                  <CircleDot className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
