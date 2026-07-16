import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/shared/section-heading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { privacyPrinciples } from "@/data/homepage";

export function PrivacySection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="rounded-2xl bg-foreground p-5 text-background sm:p-8 lg:p-10">
        <SectionHeading
          eyebrow="Privacy approach"
          title="Users should understand every document action."
          description="Paperlane explores how document tools can explain processing, data handling and user control before an action begins."
          className="text-background [&_h2]:text-background [&_p]:text-background/72"
        />
        <Alert className="border-background/15 bg-background/8 text-background">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <AlertDescription className="text-background/82">
            Paperlane is currently a frontend concept. It does not upload, store, convert or analyse documents.
          </AlertDescription>
        </Alert>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {privacyPrinciples.map((principle) => {
            const Icon = principle.icon;
            return (
              <Card key={principle.title} className="border-background/12 bg-background/6 text-background shadow-none">
                <CardContent className="p-4">
                  <Icon className="h-5 w-5 text-background/80" aria-hidden="true" />
                  <h3 className="mt-3 text-sm font-semibold">{principle.title}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Button asChild variant="secondary" className="mt-6">
          <Link to="/privacy">
            Read the Privacy Approach
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
