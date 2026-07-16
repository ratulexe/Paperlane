import { ArrowRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function HomePage() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
      <div className="flex flex-col justify-center">
        <Badge variant="secondary" className="mb-5 w-fit">
          Frontend concept
        </Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Documents, without the usual friction.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          Paperlane is a restrained React foundation for exploring clearer document workflows without uploading,
          processing or storing files.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/tools">
              Open Workspace
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/about">Learn the concept</Link>
          </Button>
        </div>
      </div>

      <Card className="self-center shadow-sm">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle>Foundation ready</CardTitle>
          <CardDescription>
            Vite, React, TypeScript, Tailwind CSS, shadcn/ui, React Router and Lucide icons are wired together for
            the next design phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            This phase intentionally keeps content simple while confirming the component system and routing foundation.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
