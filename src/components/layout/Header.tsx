import { useState, type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search, ShoppingBag, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
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
    `text-sm underline-offset-8 hover:underline ${isActive ? "font-medium underline" : "text-muted-foreground hover:text-foreground"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-3 md:px-8">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-6 sm:flex">
          <NavLink to="/" end className={linkClass}>
            Catalog
          </NavLink>
        </nav>

        <form role="search" onSubmit={submit} className="order-last relative w-full md:order-none md:ml-auto md:w-72 lg:w-96">
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="site-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden" />
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
              className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link to="/cart" className={buttonVariants({ variant: "ghost", size: "sm" })} aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}>
            <ShoppingBag />
            <span className="hidden sm:inline">Cart</span>
            <span className="grid min-w-5 place-items-center rounded-sm bg-primary px-1 text-xs text-primary-foreground tabular-nums" data-testid="cart-count">
              {count}
            </span>
          </Link>
          {status === "ready" &&
            (user ? (
              <>
                <span className="hidden max-w-32 truncate px-2 text-sm text-muted-foreground lg:inline">{user.displayName ?? user.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Log in
                </Link>
                <Link to="/register" className={buttonVariants({ size: "sm" })}>
                  Sign up
                </Link>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}
