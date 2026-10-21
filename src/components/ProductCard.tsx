import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Price } from "@/components/Price";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock === 0;
  return (
    <Link to={`/product/${product.id}`} className="group block rounded-sm">
      <Card className="gap-0 py-0 transition-colors group-hover:border-foreground/30">
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
          <img
            src={product.thumbnail}
            alt={product.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            {product.discountPercentage > 0 && !soldOut && <Badge variant="sale">{product.discountPercentage}% off</Badge>}
            {soldOut && <Badge variant="outline">Sold out</Badge>}
          </div>
        </div>
        <div className="flex flex-col gap-1 p-4">
          <p className="text-sm text-muted-foreground">
            {product.brand}, {product.categoryName}
          </p>
          <h3 className="font-medium">{product.title}</h3>
          <Price price={product.price} originalPrice={product.originalPrice} className="mt-1" />
        </div>
      </Card>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="gap-0 py-0" aria-hidden="true">
      <Skeleton className="aspect-[4/5] rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-1/4" />
      </div>
    </Card>
  );
}
