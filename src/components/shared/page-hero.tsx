import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  badge: string;
  title: string;
  description: string;
  actions?: ReactNode;
  visual?: ReactNode;
  className?: string;
};

export function PageHero({ badge, title, description, actions, visual, className }: PageHeroProps) {
  return (
    <section
      className={cn(
        "mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center",
        className,
      )}
    >
      <div>
        <Badge variant="secondary" className="mb-5">
          {badge}
        </Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
        {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      {visual ? <div className="min-w-0">{visual}</div> : null}
    </section>
  );
}
