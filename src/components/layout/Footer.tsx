import { Link } from "react-router-dom";
import { Logo } from "@/components/layout/Logo";
import { useCategories } from "@/hooks/use-catalog";
import { categoryPath } from "@/lib/categories";
import { useAuthStore } from "@/stores/auth-store";

const linkClass = "text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline";

export function Footer() {
  const { data: categories } = useCategories();
  const user = useAuthStore((s) => s.user);

  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">Everyday objects from independent makers.</p>
        </div>
        <nav aria-label="Shop">
          <p className="text-sm font-medium">Shop</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/" className={linkClass}>
                All products
              </Link>
            </li>
            {categories?.map((c) => (
              <li key={c.slug}>
                <Link to={categoryPath(c.slug)} className={linkClass}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Account">
          <p className="text-sm font-medium">Account</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/cart" className={linkClass}>
                Cart
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className={linkClass}>
                Wishlist
              </Link>
            </li>
            {!user && (
              <>
                <li>
                  <Link to="/login" className={linkClass}>
                    Log in
                  </Link>
                </li>
                <li>
                  <Link to="/register" className={linkClass}>
                    Sign up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
      <p className="mx-auto max-w-7xl border-t border-border px-5 py-6 text-xs text-muted-foreground md:px-8">
        &copy; {new Date().getFullYear()} Forme. Demo store built for a web developer assessment.
      </p>
    </footer>
  );
}
