import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Price } from "@/components/Price";
import { ProductImage } from "@/components/ProductImage";
import type { Product } from "@/types";

/** One product, large, with the reason it was picked taken from real data: lowest stock, else best discount. */
export function FeatureSpotlight({ products }: { products: Product[] }) {
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).sort((a, b) => a.stock - b.stock)[0];
  const deal = [...products].filter((p) => p.discountPercentage > 0 && p.stock > 0).sort((a, b) => b.discountPercentage - a.discountPercentage)[0];
  const product = lowStock ?? deal ?? products[0];
  if (!product) return null;

  const copy = lowStock
    ? { kicker: `Only ${product.stock} left`, heading: `The ${product.title}, while it lasts.` }
    : deal
      ? { kicker: `Save ${product.discountPercentage}%`, heading: `The ${product.title} is on sale.` }
      : { kicker: "Our top pick", heading: `The ${product.title}.` };

  return (
    <section aria-label="Spotlight" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <p className="text-sm font-medium text-sale-text">{copy.kicker}</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{copy.heading}</h2>
          <p className="mt-4 line-clamp-3 max-w-md text-muted-foreground">{product.description}</p>
          <div className="mt-7 flex flex-wrap items-center gap-6">
            <Price price={product.price} originalPrice={product.originalPrice} size="lg" />
            <Link to={`/product/${product.id}`} className={buttonVariants({ size: "lg" })}>
              View product
            </Link>
          </div>
        </div>
        <div className="relative pr-4 pb-4 md:pr-6 md:pb-6">
          <div aria-hidden="true" className="absolute right-0 bottom-0 size-3/4 rounded-3xl bg-sale/90" />
          <Link to={`/product/${product.id}`} aria-label={product.title} className="relative block aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
            <ProductImage src={product.thumbnail} alt={product.title} />
          </Link>
        </div>
      </div>
    </section>
  );
}
