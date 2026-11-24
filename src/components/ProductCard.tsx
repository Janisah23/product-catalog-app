import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Price } from "@/components/Price";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock === 0;
  return (
    <Link to={`/product/${product.id}`} className="group block rounded-3xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted">
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          className="size-full object-cover mix-blend-multiply transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 rounded-full bg-card px-3 py-1 text-[11px] text-muted-foreground">{product.categoryName}</span>
        <div className="absolute top-3 right-3 flex gap-1.5">
          {product.discountPercentage > 0 && !soldOut && (
            <Badge variant="sale" className="rounded-full">
              {product.discountPercentage}% off
            </Badge>
          )}
          {soldOut && (
            <Badge variant="outline" className="rounded-full bg-card">
              Sold out
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1 px-1 pt-4">
        <h3 className="font-medium">{product.title}</h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{product.description ?? product.brand}</p>
        <Price price={product.price} originalPrice={product.originalPrice} className="mt-2" />
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="aspect-square rounded-3xl" />
      <div className="flex flex-col gap-2 px-1 pt-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-5 w-1/4" />
      </div>
    </div>
  );
}