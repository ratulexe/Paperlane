import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { paperlaneChecklist } from "@/data/about";

export function PaperlaneIdea() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[1fr_0.9fr] lg:items-start">
      <div>
        <SectionHeading
          eyebrow="The Paperlane idea"
          title="One calm interface for everyday documents."
          description="Paperlane explores how organisation, conversion, optimisation, security and AI-assisted tools could share one consistent interaction pattern."
          className="mb-6"
        />
        <Card>
          <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
            {paperlaneChecklist.map((item) => (
              <div key={item} className="flex gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xs">
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            Frontend workflow
          </Badge>
          <CardTitle>Reusable interaction pattern</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {["Choose", "Configure", "Review"].map((stage, index) => (
            <div key={stage}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">{stage}</span>
                <span className="text-xs text-muted-foreground">Step {index + 1}</span>
              </div>
              {index < 2 ? <Separator className="mt-4" /> : null}
            </div>
          ))}
          <Progress value={66} aria-label="Concept workflow progress" />
          <p className="text-sm leading-6 text-muted-foreground">This preview demonstrates interface states only and does not process documents.</p>
          <Button variant="outline" className="w-full" type="button">
            Review Concept
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
