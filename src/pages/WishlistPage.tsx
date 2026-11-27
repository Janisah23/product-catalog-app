import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { ProductGrid, ProductGridSkeleton } from "@/components/ProductGrid";
import { StateMessage } from "@/components/StateMessage";
import { useAllProducts } from "@/hooks/use-catalog";
import { usePageTitle } from "@/hooks/use-page-title";
import { errorMessage } from "@/lib/api";
import { useWishlist } from "@/stores/wishlist-store";

export default function WishlistPage() {
  usePageTitle("Your wishlist");
  const ids = useWishlist((s) => s.ids);
  const { data, isPending, isError, error } = useAllProducts();
  const saved = (data?.data ?? []).filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <h1 className="font-serif text-4xl md:text-5xl">Your wishlist</h1>
      <p className="mt-3 text-sm text-muted-foreground">Saved in this browser. Log in and add to your cart whenever you're ready.</p>

      <div className="mt-10">
        {isError ? (
          <StateMessage title="We couldn't load your wishlist">{errorMessage(error)}</StateMessage>
        ) : isPending && ids.length > 0 ? (
          <ProductGridSkeleton count={Math.min(ids.length, 4)} columns={4} />
        ) : saved.length === 0 ? (
          <StateMessage title="Nothing saved yet" action={<Link to="/" className={buttonVariants()}>Browse the catalog</Link>}>
            Tap the heart on any product to keep it here.
          </StateMessage>
        ) : (
          <ProductGrid products={saved} columns={4} />
        )}
      </div>
    </div>
  );
}
