import { CheckCircle2, Info, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const demoFacts = [
  "Inputs are validated locally",
  "No network request is made",
  "No email is sent",
  "No form data is stored",
  "A production version would require a secure form service",
  "A real privacy policy would need to explain data handling",
];

const quickLinks = [
  { label: "Read Privacy Approach", to: "/privacy" },
  { label: "Browse Tools", to: "/tools" },
  { label: "Return Home", to: "/" },
];

export function ContactExplanation() {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Info className="h-5 w-5 text-primary" aria-hidden="true" />
          What happens in this demo?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <ul className="grid gap-3">
          {demoFacts.map((fact) => (
            <li key={fact} className="flex gap-3 text-sm leading-6">
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{fact}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-lg border bg-muted/25 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <LinkIcon className="h-4 w-4 text-primary" aria-hidden="true" />
            Quick links
          </h3>
          <div className="grid gap-2 text-sm font-medium">
            {quickLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
