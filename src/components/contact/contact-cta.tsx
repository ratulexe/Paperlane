import { Link } from "react-router-dom";
import { PageCta } from "@/components/shared/page-cta";
import { Button } from "@/components/ui/button";

export function ContactCta() {
  return (
    <PageCta title="Prefer to explore the interface first?">
      <Button asChild>
        <Link to="/tools">Browse Tools</Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/privacy">Read Privacy Approach</Link>
      </Button>
    </PageCta>
  );
}
