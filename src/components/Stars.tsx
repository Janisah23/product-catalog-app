import { Star } from "lucide-react";

export function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-2" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={i <= filled ? "size-4 fill-primary text-primary" : "size-4 text-border"} aria-hidden="true" />
        ))}
      </span>
      <span className="text-sm text-muted-foreground tabular-nums">{rating.toFixed(1)}</span>
    </span>
  );
}
