import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/Pagination";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { StateMessage } from "@/components/StateMessage";
import { PAGE_SIZE, useCategories, useProducts } from "@/hooks/use-catalog";
import { usePageTitle } from "@/hooks/use-page-title";
import { errorMessage } from "@/lib/api";
import type { SortKey } from "@/types";
import { cn } from "cn";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "rating_desc", label: "Top rated" },
  { value: "price_asc", label: "Price, low to high" },
  { value: "price_desc", label: "Price, high to low" },
];

export default function CatalogPage() {
  usePageTitle();
  const [params, setParams] = useSearchParams();
  const search = params.get("search")?.trim() || undefined;
  const category = params.get("category") || undefined;
  const sortParam = params.get("sort");
  const sort: SortKey = SORTS.some((s) => s.value === sortParam) ? (sortParam as SortKey) : "rating_desc";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const { data: categories } = useCategories();
  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useProducts({ search, category, sort, page });

  // Update one or more URL params; any change except paging returns to page 1.
  const update = useCallback(
    (changes: Record<string, string | undefined>) => {
      const next = new URLSearchParams(params);
      for (const [k, v] of Object.entries(changes)) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      if (!("page" in changes)) next.delete("page");
      setParams(next);
    },
    [params, setParams],
  );

  useEffect(() => {
    if (page > 1 || params.has("page")) window.scrollTo({ top: 0 });
  }, [page, params]);

  const meta = data?.meta;
  const first = meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const last = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;
  const activeCategory = categories?.find((c) => c.slug === category);
  const totalAll = categories?.reduce((sum, c) => sum + c.count, 0);

  const filtersActive = Boolean(search || category);

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 pt-12 pb-10 md:grid-cols-12 md:items-end md:px-8 md:pt-16">
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight md:col-span-7 md:text-7xl">Objects for a quieter home.</h1>
        <p className="max-w-md text-lg text-muted-foreground md:col-span-5 md:justify-self-end">
          Ceramics, lighting, textiles and furniture from small studios. Chosen to be used every day, and made to last.
        </p>
      </section>

      <div className="mx-auto grid max-w-7xl gap-x-12 gap-y-6 border-t border-border px-5 pt-8 md:px-8 lg:grid-cols-[11rem_1fr]">
        <nav aria-label="Categories" className="-mx-5 overflow-x-auto px-5 lg:mx-0 lg:overflow-visible lg:px-0">
          <p className="mb-3 hidden text-sm text-muted-foreground lg:block">Browse</p>
          <ul className="flex gap-6 lg:flex-col lg:gap-1">
            {[{ slug: undefined, name: "All products", count: totalAll }, ...(categories ?? [])].map((c) => {
              const active = c.slug === category;
              return (
                <li key={c.slug ?? "all"} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => update({ category: c.slug })}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex w-full items-baseline justify-between gap-3 border-b-2 border-transparent py-1.5 text-left text-sm whitespace-nowrap transition-colors lg:border-b-0 lg:border-l-2 lg:py-1 lg:pl-3",
                      active ? "border-primary font-medium text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span>{c.name}</span>
                    {c.count !== undefined && <span className="text-xs tabular-nums">{c.count}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {meta
                ? meta.total === 0
                  ? "No products found"
                  : `Showing ${first}-${last} of ${meta.total} ${meta.total === 1 ? "product" : "products"}${activeCategory ? ` in ${activeCategory.name}` : ""}${search ? ` for "${search}"` : ""}`
                : "Loading products"}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <label htmlFor="sort" className="text-muted-foreground">
                Sort by
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => update({ sort: e.target.value === "rating_desc" ? undefined : e.target.value })}
                className="h-10 rounded-sm border border-input bg-card px-3 text-sm hover:border-foreground/40"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isError ? (
            <StateMessage
              title="We couldn't load the catalog"
              action={
                <Button onClick={() => refetch()} disabled={isFetching}>
                  Try again
                </Button>
              }
            >
              {errorMessage(error)}
            </StateMessage>
          ) : isPending ? (
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
              {Array.from({ length: PAGE_SIZE }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : data.data.length === 0 ? (
            <StateMessage
              title="Nothing matches yet"
              action={
                filtersActive && (
                  <Button variant="outline" onClick={() => setParams(new URLSearchParams())}>
                    Clear search and filters
                  </Button>
                )
              }
            >
              {search ? `We couldn't find anything for "${search}". Try a shorter word or browse a category.` : "There are no products in this category."}
            </StateMessage>
          ) : (
            <>
              <ul className={cn("grid gap-x-6 gap-y-10 transition-opacity sm:grid-cols-2 lg:grid-cols-3", isPlaceholderData && "opacity-60")}>
                {data.data.map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} />
                  </li>
                ))}
              </ul>
              <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={(p) => update({ page: p === 1 ? undefined : String(p) })} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
