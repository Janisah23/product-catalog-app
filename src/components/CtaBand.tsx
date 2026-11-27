import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

/** Closing call to action. Offers sign-up to visitors and the cart to people who are logged in. */
export function CtaBand() {
  const user = useAuthStore((s) => s.user);
  return (
    <section aria-label="Get started" className="overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground md:p-12">
      <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
        <h2 className="font-serif text-4xl leading-tight md:text-5xl">Ready to find something for your home?</h2>
        <div>
          <p className="text-sm text-primary-foreground/80">
            {user ? "Your cart is saved to your account, so you can pick up where you left off." : "Create an account to keep a cart that follows you from phone to laptop."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/" className={buttonVariants({ size: "lg", className: "bg-background text-foreground hover:bg-background/90" })}>
              Browse the catalog
            </Link>
            <Link
              to={user ? "/cart" : "/register"}
              className={buttonVariants({ size: "lg", variant: "outline", className: "border-primary-foreground/40 bg-transparent text-primary-foreground hover:border-primary-foreground hover:bg-transparent" })}
            >
              {user ? "View your cart" : "Create an account"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
