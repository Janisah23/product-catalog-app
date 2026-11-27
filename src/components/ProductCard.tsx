import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Price } from "@/components/Price";
import { ProductImage } from "@/components/ProductImage";
import { WishlistButton } from "@/components/WishlistButton";
import { useAddToCart } from "@/hooks/use-cart";
import type { Product } from "@/types";
import { cn } from "cn";

interface Props {
  product: Product;
  /** "shop" adds Add to cart and Buy now buttons. "minimal" is image, name and price only. */
  variant?: "shop" | "minimal";
}

export function ProductCard({ product, variant = "shop" }: Props) {
  const { addToCart, buyNow, isPending } = useAddToCart();
  const soldOut = product.stock === 0;
  const onSale = product.discountPercentage > 0 && !soldOut;
  const low = !soldOut && product.stock <= 5;
  const href = `/product/${product.id}`;
  const portrait = variant === "minimal";

  return (
    <article className="group flex h-full flex-col">
      <div className="relative">
        <Link
          to={href}
          aria-label={product.title}
          className={cn("relative block overflow-hidden rounded-2xl bg-muted", portrait ? "aspect-[4/5]" : "aspect-square")}
        >
          <ProductImage src={product.thumbnail} alt={product.title} className="transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]" />
        </Link>
        <WishlistButton productId={product.id} title={product.title} className="absolute top-3 left-3" />
        <div className="pointer-events-none absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {onSale && <Badge variant="sale">-{product.discountPercentage}%</Badge>}
          {soldOut && <Badge variant="outline">Sold out</Badge>}
          {low && <Badge variant="secondary">Only {product.stock} left</Badge>}
        </div>
      </div>

      <div className="mt-3.5 flex flex-1 flex-col sm:mt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm leading-snug font-medium sm:text-base">
              <Link to={href} className="underline-offset-4 hover:underline">
                {product.title}
              </Link>
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{product.brand}</p>
          </div>
          <Price price={product.price} originalPrice={product.originalPrice} stacked className="shrink-0" />
        </div>

        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-primary text-primary" aria-hidden="true" />
          <span className="sr-only">Rated</span>
          <span className="font-medium text-foreground tabular-nums">{product.rating.toFixed(1)}</span>
          <span>/ 5</span>
        </p>

        {variant === "shop" && (
          <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
            <Button variant="outline" size="sm" disabled={soldOut || isPending} onClick={() => addToCart(product.id)}>
              Add to cart
            </Button>
            <Button size="sm" disabled={soldOut || isPending} onClick={() => buyNow(product.id)}>
              {soldOut ? "Sold out" : "Buy now"}
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}

export function ProductCardSkeleton({ variant = "shop" }: { variant?: "shop" | "minimal" }) {
  return (
    <div aria-hidden="true">
      <Skeleton className={cn("rounded-2xl", variant === "minimal" ? "aspect-[4/5]" : "aspect-square")} />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        {variant === "shop" && <Skeleton className="mt-4 h-9 w-full" />}
      </div>
    </div>
  );
}
