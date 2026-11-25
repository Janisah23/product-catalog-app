import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Price } from "@/components/Price";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock === 0;
  return (
    <Link to={`/product/${product.id}`} className="group block rounded-3xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
        />
        <span className="absolute top-2.5 left-2.5 rounded-full bg-card/90 px-2.5 py-1 text-[11px] text-muted-foreground backdrop-blur sm:top-3 sm:left-3">
          {product.categoryName}
        </span>
        <div className="absolute top-2.5 right-2.5 flex gap-1.5 sm:top-3 sm:right-3">
          {product.discountPercentage > 0 && !soldOut && (
            <Badge variant="sale" className="rounded-full">
              -{product.discountPercentage}%
            </Badge>
          )}
          {soldOut && (
            <Badge variant="outline" className="rounded-full bg-card">
              Sold out
            </Badge>
          )}
        </div>
        <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium backdrop-blur sm:bottom-3 sm:left-3">
          <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden="true" />
          {product.rating.toFixed(1)}
        </span>
      </div>
      <div className="flex flex-col gap-1 px-1 pt-3 sm:pt-4">
        <h3 className="text-sm leading-snug font-medium sm:text-base">{product.title}</h3>
        <p className="line-clamp-2 hidden text-xs leading-relaxed text-muted-foreground sm:block">{product.description ?? product.brand}</p>
        <Price price={product.price} originalPrice={product.originalPrice} className="mt-1 sm:mt-2" />
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="aspect-[4/5] rounded-3xl" />
      <div className="flex flex-col gap-2 px-1 pt-3 sm:pt-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="hidden h-3 w-full sm:block" />
        <Skeleton className="h-5 w-1/4" />
      </div>
    </div>
  );
}