import { ArrowRight, FileText, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHero } from "@/components/shared/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { workflowStages } from "@/data/about";

function AboutHeroVisual() {
  return (
    <Card className="mx-auto max-w-md overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary">Product concept</Badge>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">PDF</Badge>
        </div>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
          Proposal packet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">Document selected</span>
            <Badge variant="outline">Ready</Badge>
          </div>
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-primary/20" />
            <div className="h-2 w-4/5 rounded-full bg-muted" />
            <div className="h-2 w-3/5 rounded-full bg-muted" />
          </div>
        </div>

        <div className="grid gap-3">
          {workflowStages.map((stage, index) => (
            <div key={stage} className="grid grid-cols-[auto_1fr] items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                {index + 1}
              </span>
              <span className="text-sm font-medium">{stage}</span>
              {index < workflowStages.length - 1 ? <span className="ml-3 h-4 w-px bg-border" aria-hidden="true" /> : null}
            </div>
          ))}
        </div>

        <Separator />

        <Card className="border-primary/15 bg-secondary/50 py-4 shadow-none">
          <CardContent className="flex items-center justify-between gap-4 px-4">
            <span className="text-sm font-medium">Workflow reviewed</span>
            <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

export function AboutHero() {
  return (
    <PageHero
      badge="About Paperlane"
      title="Documents should feel manageable, not overwhelming."
      description="Paperlane is a frontend product concept exploring how everyday document tools can become easier to understand, more consistent and more transparent."
      visual={<AboutHeroVisual />}
      actions={
        <>
          <Button asChild>
            <Link to="/tools">
              Explore Tools
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/privacy">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Our Privacy Approach
            </Link>
          </Button>
        </>
      }
    />
  );
}
