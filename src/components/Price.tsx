import { formatPrice } from "@/lib/format";
import { cn } from "cn";

export function Price({ price, originalPrice, className, size = "md" }: { price: number; originalPrice: number | null; className?: string; size?: "md" | "lg" }) {
  return (
    <p className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-medium tabular-nums", size === "lg" ? "text-2xl" : "text-base")}>{formatPrice(price)}</span>
      {originalPrice !== null && originalPrice > price && (
        <>
          <span className="sr-only">Original price</span>
          <s className={cn("text-muted-foreground tabular-nums", size === "lg" ? "text-base" : "text-sm")}>{formatPrice(originalPrice)}</s>
        </>
      )}
    </p>
  );
}
