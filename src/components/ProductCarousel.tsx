import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types";

interface Props {
  title: string;
  description?: ReactNode;
  products: Product[];
  variant?: "shop" | "minimal";
}

/** Horizontal scroll-snap row. Swipes on touch screens; the arrows page through it on desktop. */
export function ProductCarousel({ title, description, products, variant = "shop" }: Props) {
  const track = useRef<HTMLUListElement>(null);
  const page = (direction: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

  if (products.length === 0) return null;
  const arrow = "grid size-10 place-items-center rounded-full border border-border bg-card transition-colors hover:border-foreground/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none";

  return (
    <section aria-label={title}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl">{title}</h2>
          {description && <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => page(-1)} aria-label={`Previous ${title}`} className={arrow}>
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" onClick={() => page(1)} aria-label={`Next ${title}`} className={arrow}>
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <ul ref={track} className="relative -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto scroll-smooth px-5 pb-2 no-scrollbar md:-mx-8 md:scroll-px-8 md:px-8">
        {products.map((p) => (
          <li key={p.id} className="w-[68%] shrink-0 snap-start sm:w-[44%] md:w-[31%] lg:w-[23.5%]">
            <ProductCard product={p} variant={variant} />
          </li>
        ))}
      </ul>
    </section>
  );
}
