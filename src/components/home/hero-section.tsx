import { ArrowDown, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const capabilityItems = [
  { label: "9 browser-local tools", icon: CheckCircle2 },
  { label: "2 temporary cloud tools", icon: Sparkles },
  { label: "No server upload for local tools", icon: ShieldCheck },
];

export function HeroSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 text-center sm:px-6 md:py-8">
      <div className="mx-auto max-w-4xl">
        <Badge variant="secondary" className="mb-3">
          Document tools, made clearer
        </Badge>
        <h1 className="mx-auto max-w-4xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          All your document tools, in <span className="text-primary">one clear workspace.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          Process supported documents locally in your browser and explore additional workflows through a consistent,
          privacy-conscious interface.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <a href="#homepage-tools">
              Browse Tools
              <ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="#local-processing">How Local Processing Works</a>
          </Button>
        </div>
        <ul className="mt-4 flex flex-wrap justify-center gap-2 text-sm font-medium text-muted-foreground">
          {capabilityItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Badge variant="outline" className="gap-2 bg-card/70 px-3 py-1.5">
                  <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {item.label}
                </Badge>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
