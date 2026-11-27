import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImage } from "@/components/ProductImage";
import type { Product } from "@/types";

interface Props {
  featured?: Product;
  deal?: Product;
  loading: boolean;
}

/** Full-width intro band: headline, two actions, the top-rated product and the best current discount. */
export function Hero({ featured, deal, loading }: Props) {
  return (
    <section aria-label="Introduction" className="bg-secondary">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pt-10 pb-24 md:grid-cols-12 md:items-center md:gap-8 md:px-8 md:pt-16 md:pb-28">
        <div className="md:col-span-6">
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight md:text-7xl">Objects for a quieter home.</h1>
          <p className="mt-5 max-w-md text-base text-muted-foreground md:text-lg">
            Ceramics, lighting, textiles and furniture from small studios. Chosen to be used every day, and made to last.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#products" className={buttonVariants({ size: "lg" })}>
              Shop the collection
            </a>
            {featured && (
              <Link to={`/product/${featured.id}`} className={buttonVariants({ size: "lg", variant: "outline" })}>
                See our top pick
              </Link>
            )}
          </div>
        </div>

        <div className="relative md:col-span-6">
          {loading ? (
            <Skeleton className="aspect-[5/4] rounded-3xl bg-card" />
          ) : (
            featured && (
              <Link to={`/product/${featured.id}`} aria-label={featured.title} className="relative block aspect-[5/4] overflow-hidden rounded-3xl bg-card">
                <ProductImage src={featured.thumbnail} alt={featured.title} priority />
              </Link>
            )
          )}
          {deal && (
            <Link
              to={`/product/${deal.id}`}
              className="absolute -bottom-9 left-4 flex w-60 items-center justify-between gap-3 rounded-2xl bg-sale p-4 text-sale-foreground shadow-sm transition-transform hover:-translate-y-0.5 md:right-6 md:left-auto"
            >
              <span className="min-w-0">
                <span className="block font-serif text-2xl leading-none">Save {deal.discountPercentage}%</span>
                <span className="mt-1.5 block truncate text-xs opacity-90">{deal.title}</span>
              </span>
              <ArrowUpRight className="size-5 shrink-0" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
