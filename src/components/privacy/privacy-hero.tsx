import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHero } from "@/components/shared/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { transparentWorkflow } from "@/data/privacy";

function PrivacyHeroVisual() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <Badge variant="secondary" className="w-fit">
          Intended transparent workflow
        </Badge>
        <CardTitle className="text-lg">Privacy communication concept</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {transparentWorkflow.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="grid grid-cols-[auto_1fr] gap-3 rounded-lg border bg-muted/25 p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold">{item.title}</h2>
                  <span className="text-xs text-muted-foreground">0{index + 1}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function PrivacyHero({ onViewPrinciples }: { onViewPrinciples: () => void }) {
  return (
    <PageHero
      badge="Privacy by design"
      title="Privacy should be understandable."
      description="People should not have to guess what happens when they select a document. Paperlane explores how document tools could communicate actions, limitations and intended file handling more clearly."
      visual={<PrivacyHeroVisual />}
      actions={
        <>
          <Button onClick={onViewPrinciples}>
            View Privacy Principles
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button asChild variant="outline">
            <Link to="/tools">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Explore Tools
            </Link>
          </Button>
        </>
      }
    />
  );
}
