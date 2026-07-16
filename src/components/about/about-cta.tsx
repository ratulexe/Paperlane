import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PageCta } from "@/components/shared/page-cta";
import { Button } from "@/components/ui/button";

export function AboutCta() {
  return (
    <PageCta title="See how Paperlane turns complex actions into clearer steps.">
      <Button asChild>
        <Link to="/tools">
          Browse Tools
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/contact">Contact Paperlane</Link>
      </Button>
    </PageCta>
  );
}
