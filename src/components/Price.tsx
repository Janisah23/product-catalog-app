import { formatPrice } from "@/lib/format";
import { cn } from "cn";

interface Props {
  price: number;
  originalPrice: number | null;
  className?: string;
  size?: "md" | "lg";
  /** Puts the original price under the current one, right aligned. */
  stacked?: boolean;
}

export function Price({ price, originalPrice, className, size = "md", stacked }: Props) {
  return (
    <p className={cn("flex", stacked ? "flex-col items-end gap-0.5" : "items-baseline gap-2", className)}>
      <span className={cn("font-semibold tabular-nums", size === "lg" ? "text-3xl tracking-tight" : "text-sm sm:text-base")}>{formatPrice(price)}</span>
      {originalPrice !== null && originalPrice > price && (
        <>
          <span className="sr-only">Original price</span>
          <s className={cn("text-muted-foreground tabular-nums", size === "lg" ? "text-base" : "text-xs")}>{formatPrice(originalPrice)}</s>
        </>
      )}
    </p>
  );
}
