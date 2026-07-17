import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FinalCtaSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 pb-16 sm:px-6 md:py-16">
      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between lg:p-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Everything you need, without leaving your browser.
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Start with a browser-local PDF tool or explore Paperlane's wider collection of document-workflow
              concepts.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="#homepage-tools">
                Open Document Tools
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/privacy">Read the Privacy Approach</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
