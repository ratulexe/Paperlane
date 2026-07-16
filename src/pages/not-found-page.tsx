import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePageMetadata } from "@/lib/use-page-metadata";

export function NotFoundPage() {
  usePageMetadata({
    title: "Page Not Found | Paperlane",
    description: "The requested Paperlane page could not be found.",
  });

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">404</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Page not found.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
        The page you are looking for does not exist in the Paperlane React foundation.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">Return home</Link>
      </Button>
    </section>
  );
}
