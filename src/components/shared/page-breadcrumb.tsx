import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type PageBreadcrumbProps = {
  current: string;
};

export function PageBreadcrumb({ current }: PageBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <li>
          <Link to="/" className="font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Home
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="h-4 w-4" />
        </li>
        <li className="font-medium text-foreground" aria-current="page">
          {current}
        </li>
      </ol>
    </nav>
  );
}
