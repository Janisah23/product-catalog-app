import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/QuantityStepper";
import { WishlistButton } from "@/components/WishlistButton";
import { useAddToCart } from "@/hooks/use-cart";
import { MAX_LINE_QTY, type Product } from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "cn";

/** Stock status, quantity, Add to cart and wishlist for the product page. */
export function ProductActions({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const user = useAuthStore((s) => s.user);
  const { addToCart, isPending, isSuccess } = useAddToCart();

  const soldOut = product.stock === 0;
  const low = !soldOut && product.stock <= 5;
  const maxQty = Math.max(1, Math.min(product.stock, MAX_LINE_QTY));

  return (
    <div>
      <p className="flex items-center gap-2 text-sm" data-testid="stock-status">
        <span className={cn("size-2 rounded-full", soldOut || low ? "bg-sale" : "bg-primary")} aria-hidden="true" />
        {soldOut ? "Out of stock" : low ? `Only ${product.stock} left in stock` : "In stock, ready to ship"}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!soldOut && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Quantity</span>
            <QuantityStepper value={quantity} max={maxQty} onChange={setQuantity} label={product.title} disabled={isPending} />
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button size="lg" className="h-14 flex-1 text-base" onClick={() => addToCart(product.id, quantity)} disabled={soldOut || isPending}>
          {soldOut ? "Sold out" : isPending ? "Adding…" : user ? "Add to cart" : "Log in to add to cart"}
        </Button>
        <WishlistButton productId={product.id} title={product.title} variant="outline" />
      </div>

      {isSuccess && (
        <p className="mt-3 text-sm">
          <Link to="/cart" className="border-b border-foreground/30 pb-0.5 font-medium hover:border-foreground">
            View your cart →
          </Link>
        </p>
      )}
    </div>
  );
}
