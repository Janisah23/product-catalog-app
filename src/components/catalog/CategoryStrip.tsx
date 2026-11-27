import { Link } from "react-router-dom";
import { categoryIcon, categoryPath } from "@/lib/categories";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/use-catalog";
import type { Product } from "@/types";

/** White card that overlaps the hero. Each category opens its own page. */
export function CategoryStrip({ deal }: { deal?: Product }) {
  const { data: categories, isPending } = useCategories();

  return (
    <div className="relative z-10 mx-auto -mt-12 max-w-7xl px-5 md:-mt-14 md:px-8">
      <nav aria-label="Shop by category" className="flex overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
        <ul className="relative flex flex-1 overflow-x-auto no-scrollbar">
          {isPending
            ? Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="flex min-w-28 flex-1 flex-col items-center gap-3 px-4 py-5">
                  <Skeleton className="size-11 rounded-full" />
                  <Skeleton className="h-3 w-14" />
                </li>
              ))
            : categories?.map((c) => {
                const Icon = categoryIcon(c.slug);
                return (
                  <li key={c.slug} className="min-w-28 flex-1">
                    <Link to={categoryPath(c.slug)} className="group flex h-full flex-col items-center gap-3 px-4 py-5 text-center transition-colors hover:bg-secondary/60">
                      <span className="grid size-11 place-items-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="text-xs font-medium">{c.name}</span>
                    </Link>
                  </li>
                );
              })}
        </ul>
        {deal && (
          <Link to={`/product/${deal.id}`} className="hidden w-44 shrink-0 flex-col justify-center bg-sale px-5 text-sale-foreground transition-opacity hover:opacity-95 md:flex">
            <span className="text-[11px] tracking-wide uppercase opacity-90">On sale</span>
            <span className="font-serif text-3xl leading-tight">{deal.discountPercentage}% off</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
