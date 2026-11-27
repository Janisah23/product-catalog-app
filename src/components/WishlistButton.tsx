import { Heart } from "lucide-react";
import { useWishlist } from "@/stores/wishlist-store";
import { toast } from "@/stores/toast-store";
import { cn } from "cn";

interface Props {
  productId: string;
  title: string;
  /** "overlay" floats on a photo; "outline" is a bordered square button. */
  variant?: "overlay" | "outline";
  className?: string;
}

export function WishlistButton({ productId, title, variant = "overlay", className }: Props) {
  const saved = useWishlist((s) => s.ids.includes(productId));
  const toggle = useWishlist((s) => s.toggle);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
      onClick={() => toast(toggle(productId) ? "Saved to your wishlist" : "Removed from your wishlist")}
      className={cn(
        "grid shrink-0 place-items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
        variant === "overlay" ? "size-9 bg-card/90 shadow-sm backdrop-blur hover:bg-card" : "size-14 border border-input bg-card hover:border-foreground/40",
        className,
      )}
    >
      <Heart className={cn("size-[18px]", saved ? "fill-sale text-sale" : "text-foreground")} aria-hidden="true" />
    </button>
  );
}
