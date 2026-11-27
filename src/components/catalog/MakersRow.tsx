import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ProductImage } from "@/components/ProductImage";
import type { Product } from "@/types";

/** Brands taken from the product data. Each links to a search for that brand. */
export function MakersRow({ products }: { products: Product[] }) {
  const makers = useMemo(() => {
    const byBrand = new Map<string, { name: string; count: number; product: Product }>();
    for (const p of products) {
      const entry = byBrand.get(p.brand);
      if (entry) entry.count += 1;
      else byBrand.set(p.brand, { name: p.brand, count: 1, product: p });
    }
    return [...byBrand.values()].slice(0, 6);
  }, [products]);

  if (makers.length === 0) return null;
  return (
    <section aria-label="Featured makers" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <h2 className="font-serif text-3xl md:text-4xl">Featured makers</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">The small studios behind the pieces in this catalog.</p>
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-6">
        {makers.map((m) => (
          <li key={m.name}>
            <Link to={`/?search=${encodeURIComponent(m.name)}`} className="group flex flex-col items-center text-center">
              <span className="relative block size-24 overflow-hidden rounded-full bg-muted ring-2 ring-transparent ring-offset-2 ring-offset-background transition group-hover:ring-primary md:size-28">
                <ProductImage src={m.product.thumbnail} alt="" />
              </span>
              <span className="mt-4 text-sm font-medium">{m.name}</span>
              <span className="mt-0.5 text-xs text-muted-foreground">
                {m.count} {m.count === 1 ? "product" : "products"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
