import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { WorkspacePreview } from "@/components/home/workspace-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supportPoints } from "@/data/homepage";

export function HeroSection() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:py-18 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-22">
      <div>
        <Badge variant="secondary" className="mb-5">
          Privacy-conscious document workspace
        </Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Documents,{" "}
          <span className="text-primary underline decoration-primary/20 decoration-4 underline-offset-4">
            without the usual friction
          </span>
          .
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Paperlane brings everyday document tools into one clear workspace for organising, converting and
          understanding files.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/tools">
              Explore Tools
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a href="#how-it-works">See How It Works</a>
          </Button>
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground">
          {supportPoints.map((point) => (
            <li key={point} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <WorkspacePreview />
    </section>
  );
}
