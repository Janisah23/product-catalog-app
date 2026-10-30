import { useState, type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search, ShoppingBag, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/layout/Logo";
import { useCart } from "@/hooks/use-cart";
import { logOut } from "@/lib/auth-actions";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/stores/toast-store";

export function Header() {
  const { user, status } = useAuthStore();
  const { data: cart } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const urlSearch = params.get("search") ?? "";
  const [query, setQuery] = useState(urlSearch);

  // Keep the box in step with the URL on the catalog, and empty it elsewhere.
  const syncKey = pathname === "/" ? urlSearch : "";
  const [prevKey, setPrevKey] = useState(syncKey);
  if (prevKey !== syncKey) {
    setPrevKey(syncKey);
    setQuery(syncKey);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams();
    const category = pathname === "/" ? params.get("category") : null;
    if (category) next.set("category", category);
    if (query.trim()) next.set("search", query.trim());
    navigate({ pathname: "/", search: next.toString() });
  }

  async function handleLogout() {
    await logOut();
    toast("You have been logged out");
    navigate("/");
  }

  const count = cart?.itemCount ?? 0;
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm tracking-wide underline decoration-1 underline-offset-[10px] transition-colors ${
      isActive
        ? "text-foreground decoration-foreground"
        : "text-muted-foreground decoration-transparent hover:text-foreground hover:decoration-foreground/40"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-10 gap-y-4 px-5 py-4 md:px-8 md:py-5">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-8 sm:flex">
          <NavLink to="/" end className={linkClass}>
            Catalog
          </NavLink>
        </nav>

        <form
          role="search"
          onSubmit={submit}
          className="relative order-last w-full md:order-none md:ml-auto md:w-72 lg:w-96"
        >
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="site-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="h-10 rounded-full border-border bg-card pr-10 pl-11 text-sm shadow-none placeholder:text-muted-foreground focus-visible:ring-1 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                if (urlSearch) {
                  const next = new URLSearchParams(params);
                  next.delete("search");
                  next.delete("page");
                  navigate({ pathname: "/", search: next.toString() });
                }
              }}
              className="absolute top-1/2 right-3 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            to="/cart"
            className={`${buttonVariants({ variant: "ghost", size: "sm" })} gap-2 rounded-full px-3`}
            aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
          >
            <ShoppingBag className="size-[18px]" />
            <span className="hidden sm:inline">Cart</span>
            <span
              className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground tabular-nums"
              data-testid="cart-count"
            >
              {count}
            </span>
          </Link>

          {status === "ready" &&
            (user ? (
              <>
                <span className="hidden max-w-32 truncate px-2 text-sm text-muted-foreground lg:inline">
                  {user.displayName ?? user.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:border-foreground"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`${buttonVariants({ variant: "ghost", size: "sm" })} rounded-full px-4`}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className={`${buttonVariants({ size: "sm" })} rounded-full px-5`}
                >
                  Sign up
                </Link>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}