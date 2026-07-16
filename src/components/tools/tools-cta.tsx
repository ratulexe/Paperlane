import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ToolsCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 pb-16 sm:px-6 md:py-16">
      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between lg:p-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Have a document workflow in mind?</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Paperlane is a developing frontend concept. Share the kind of document tool you would find useful.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/contact">
                Suggest a Tool
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
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
