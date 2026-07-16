import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PageCta } from "@/components/shared/page-cta";
import { Button } from "@/components/ui/button";

export function PrivacyCta() {
  return (
    <PageCta title="Have a question about the Paperlane privacy concept?">
      <Button asChild>
        <Link to="/contact">
          Contact Paperlane
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/tools">Explore Document Tools</Link>
      </Button>
    </PageCta>
  );
}
