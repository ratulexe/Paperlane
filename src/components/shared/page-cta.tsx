import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

type PageCtaProps = {
  title: string;
  children: ReactNode;
};

export function PageCta({ title, children }: PageCtaProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <Card className="overflow-hidden border-primary/15 bg-card">
        <CardContent className="flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-2xl text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
          <div className="flex flex-wrap gap-3">{children}</div>
        </CardContent>
      </Card>
    </section>
  );
}
