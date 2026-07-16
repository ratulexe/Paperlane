import { ArrowRight, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHero } from "@/components/shared/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contactVisualItems } from "@/data/contact";

function ContactHeroVisual() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <Badge variant="secondary" className="w-fit">
          Choose an enquiry type
        </Badge>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-primary" aria-hidden="true" />
          Contact concept
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {contactVisualItems.map((item) => (
          <div key={item} className="flex items-center justify-between gap-3 rounded-lg border bg-muted/25 p-3">
            <span className="text-sm font-medium">{item}</span>
            <Badge variant="outline">Demo</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ContactHero({ onSendDemoMessage }: { onSendDemoMessage: () => void }) {
  return (
    <PageHero
      badge="Contact Paperlane"
      title="Let's make document work simpler."
      description="Share product feedback, suggest a document workflow or ask a question about the Paperlane frontend concept."
      visual={<ContactHeroVisual />}
      actions={
        <>
          <Button onClick={onSendDemoMessage}>
            Send Demo Message
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button asChild variant="outline">
            <Link to="/tools">Browse Tools</Link>
          </Button>
        </>
      }
    />
  );
}
