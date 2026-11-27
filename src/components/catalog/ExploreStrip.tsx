import { Link } from "react-router-dom";
import { ProductImage } from "@/components/ProductImage";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";

/** Dark full-width band of tall photo tiles. */
export function ExploreStrip({ products }: { products: Product[] }) {
  if (products.length < 3) return null;
  return (
    <section aria-label="More to explore" className="bg-foreground py-16 text-background">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="font-serif text-3xl md:text-4xl">More to explore</h2>
        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          {products.slice(0, 5).map((p, i) => (
            <li key={p.id} className={i === 4 ? "hidden md:block" : undefined}>
              <Link to={`/product/${p.id}`} className="group relative block aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                <ProductImage src={p.thumbnail} alt={p.title} className="transition-transform duration-500 motion-safe:group-hover:scale-[1.04]" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-20 text-white">
                  <p className="text-sm leading-snug font-medium">{p.title}</p>
                  <p className="mt-0.5 text-xs text-white/80 tabular-nums">{formatPrice(p.price)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
