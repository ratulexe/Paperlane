import { ArrowUp } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { categoryLabels, categoryOverview, tools } from "@/data/tools";
import type { ToolCategory } from "@/types/tool";

type ToolCategoryOverviewProps = {
  onSelectCategory: (category: ToolCategory) => void;
};

export function ToolCategoryOverview({ onSelectCategory }: ToolCategoryOverviewProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading title="One interface, several document needs." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {categoryOverview.map((item) => {
          const Icon = item.icon;
          const count = tools.filter((tool) => tool.category === item.category).length;
          return (
            <Card key={item.category} className="shadow-none">
              <CardContent className="flex h-full flex-col p-4">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-semibold text-foreground">{categoryLabels[item.category]}</h3>
                <p className="mt-1 text-sm font-medium text-muted-foreground">{count} tools</p>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => onSelectCategory(item.category)}>
                  Show category
                  <ArrowUp className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
