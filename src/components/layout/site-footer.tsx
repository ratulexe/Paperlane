import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Tools", to: "/tools" },
  { label: "Privacy", to: "/privacy" },
  { label: "Contact", to: "/contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr]">
        <div>
          <Link to="/" className="paperlane-wordmark inline-block text-4xl leading-none text-foreground">
            Paperlane
          </Link>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Paperlane is a frontend concept exploring clearer and more approachable document workflows.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-muted-foreground" aria-label="Footer navigation">
          {footerLinks.map((item) => (
            <Link key={item.to} to={item.to} className="transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
        <Separator />
        <p className="mt-5 text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Paperlane. Frontend concept only.</p>
      </div>
    </footer>
  );
}
