import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { categoryLabels } from "@/data/tools";
import { getToolStatusLabel } from "@/lib/tool-routes";
import type { DocumentTool } from "@/types/tool";

type ToolCardProps = {
  tool: DocumentTool;
  to?: string;
};

export function ToolCard({ tool, to }: ToolCardProps) {
  const Icon = tool.icon;
  const visibleBadges = tool.badges.filter((badge) => badge !== "none");
  const isAvailable = tool.implementationStatus !== "coming-soon";
  const statusLabel = getToolStatusLabel(tool);

  return (
    <Card
      className={
        isAvailable
          ? "group h-full transition-colors hover:border-primary/40 hover:shadow-sm focus-within:border-primary/50"
          : "h-full border-dashed bg-card/70 shadow-none transition-colors"
      }
    >
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Badge variant="secondary">{categoryLabels[tool.category]}</Badge>
            <Badge variant={isAvailable ? "default" : "outline"}>{statusLabel}</Badge>
            {visibleBadges.map((badge) => (
              <Badge key={badge} variant={badge === "ai" ? "outline" : "default"}>
                {badge === "ai" ? "AI" : badge[0].toUpperCase() + badge.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
        <h2 className="text-lg font-semibold text-foreground">{tool.name}</h2>
        <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{tool.shortDescription}</p>
        {!isAvailable ? (
          <>
            <p className="mt-4 text-sm font-medium text-muted-foreground">Planned tool — not available yet.</p>
            <Button
              className="mt-3 w-full cursor-not-allowed justify-center opacity-60"
              variant="outline"
              disabled
              aria-label={`${tool.name} is coming soon`}
            >
              Coming soon
            </Button>
          </>
        ) : to ? (
          <Button className="mt-5 w-full justify-between" variant="outline" asChild>
            <Link to={to} aria-label={`Open ${tool.name} tool page`}>
              Open Tool
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button className="mt-5 w-full justify-between" variant="outline" disabled aria-label={`${tool.name} tool route unavailable`}>
            Open Tool
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
