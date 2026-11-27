import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import type { Product } from "@/types";
import { cn } from "cn";

const COLUMNS = {
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
} as const;

interface Props {
  products: Product[];
  variant?: "shop" | "minimal";
  columns?: keyof typeof COLUMNS;
  dimmed?: boolean;
}

const GAP = "gap-x-3 gap-y-8 md:gap-x-5 md:gap-y-10";

export function ProductGrid({ products, variant = "shop", columns = 3, dimmed }: Props) {
  return (
    <ul className={cn("grid transition-opacity", GAP, COLUMNS[columns], dimmed && "opacity-60")}>
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} variant={variant} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count, columns = 3, variant = "shop" }: { count: number; columns?: keyof typeof COLUMNS; variant?: "shop" | "minimal" }) {
  return (
    <div className={cn("grid", GAP, COLUMNS[columns])} aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
