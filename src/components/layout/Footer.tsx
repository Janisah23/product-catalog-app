import { Link } from "react-router-dom";
import { Logo } from "@/components/layout/Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">Everyday objects from independent makers.</p>
        </div>
        <nav aria-label="Footer" className="flex gap-6 text-sm">
          <Link to="/" className="underline-offset-4 hover:underline">
            Catalog
          </Link>
          <Link to="/cart" className="underline-offset-4 hover:underline">
            Cart
          </Link>
        </nav>
      </div>
      <p className="mx-auto max-w-7xl px-5 pb-8 text-xs text-muted-foreground md:px-8">&copy; {new Date().getFullYear()} Forme. Demo store built for a web developer assessment.</p>
    </footer>
  );
}
