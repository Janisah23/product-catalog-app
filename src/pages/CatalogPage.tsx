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

// Bento column spans (out of 12) for the category tiles. Rows alternate wide/narrow.
const TILE_SPANS = ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"];

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
  const tiles = (categories ?? []).slice(0, 4);

  const scrollToProducts = () => document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 pt-4 pb-16 md:px-6">
      {/* Hero */}
      <section className="grid gap-6 rounded-3xl bg-gradient-to-br from-[#fdf1ea] via-[#fbe7de] to-[#f8dcd0] px-6 py-12 md:grid-cols-12 md:items-end md:px-12 md:py-16">
        <div className="md:col-span-7">
          <h1 className="text-4xl leading-[1.1] font-semibold tracking-tight md:text-6xl">Objects for a quieter home.</h1>
          <p className="mt-4 max-w-md text-base text-foreground/70 md:text-lg">
            Ceramics, lighting, textiles and furniture from small studios. Chosen to be used every day, and made to last.
          </p>
          <button
            type="button"
            onClick={scrollToProducts}
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium shadow-sm transition-colors hover:bg-white/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            Shop now
          </button>
        </div>
        <p className="text-sm text-foreground/60 md:col-span-5 md:justify-self-end md:text-right">
          {totalAll !== undefined ? `${totalAll} products in ${categories?.length ?? 0} categories` : "\u00a0"}
        </p>
      </section>

      {/* Category bento */}
      {(isPending && !categories) || tiles.length > 0 ? (
        <section aria-label="Categories" className="rounded-3xl bg-card p-3 shadow-sm md:p-5">
          <div className="grid gap-3 md:grid-cols-12 md:gap-4">
            {tiles.length === 0
              ? Array.from({ length: 4 }, (_, i) => <div key={i} className={cn("h-44 animate-pulse rounded-3xl bg-muted", TILE_SPANS[i])} />)
              : tiles.map((c, i) => (
                  <CategoryTile
                    key={c.slug}
                    category={c}
                    span={TILE_SPANS[i]}
                    active={c.slug === category}
                    onSelect={() => {
                      update({ category: c.slug === category ? undefined : c.slug });
                      scrollToProducts();
                    }}
                  />
                ))}
          </div>
        </section>
      ) : null}

      {/* Products */}
      <section id="products" className="scroll-mt-4 rounded-3xl bg-card p-5 shadow-sm md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-medium tracking-tight">{activeCategory ? activeCategory.name : "Bestsellers"}</h2>
            <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
              {meta
                ? meta.total === 0
                  ? "No products found"
                  : `Showing ${first}-${last} of ${meta.total} ${meta.total === 1 ? "product" : "products"}${search ? ` for "${search}"` : ""}`
                : "Loading products"}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {filtersActive && (
              <button
                type="button"
                onClick={() => setParams(new URLSearchParams())}
                className="border-b border-foreground/30 pb-0.5 text-xs font-medium hover:border-foreground"
              >
                Browse all products →
              </button>
            )}
            <label htmlFor="sort" className="text-muted-foreground">
              Sort by
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => update({ sort: e.target.value === "rating_desc" ? undefined : e.target.value })}
              className="h-10 rounded-full border border-input bg-muted px-4 text-sm hover:border-foreground/40"
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
          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
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
            <ul className={cn("grid gap-x-5 gap-y-8 transition-opacity sm:grid-cols-2 lg:grid-cols-4", isPlaceholderData && "opacity-60")}>
              {data.data.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
            <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={(p) => update({ page: p === 1 ? undefined : String(p) })} />
          </>
        )}
      </section>
    </div>
  );
}

type CategoryTileProps = {
  category: { slug: string; name: string; count: number };
  span: string;
  active: boolean;
  onSelect: () => void;
};

// Uses the top-rated product's thumbnail from the category as the tile photo.
function CategoryTile({ category: c, span, active, onSelect }: CategoryTileProps) {
  const { data } = useProducts({ category: c.slug, sort: "rating_desc", page: 1 });
  const image = data?.data[0]?.thumbnail;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "group relative flex h-44 flex-col justify-center overflow-hidden rounded-3xl bg-muted px-8 text-left transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none md:h-52",
        span,
        active && "ring-2 ring-primary",
      )}
    >
      <span className="relative z-10 text-2xl font-normal tracking-tight">{c.name}</span>
      <span className="relative z-10 mt-2 text-xs text-muted-foreground">
        {c.count} {c.count === 1 ? "product" : "products"}
      </span>
      <span className="relative z-10 mt-4 w-fit border-b border-foreground/30 pb-0.5 text-xs font-medium">
        {active ? "Clear category" : "Explore category"} {active ? "\u00d7" : "\u2192"}
      </span>
      {image ? (
        <img
          src={image}
          alt=""
          loading="lazy"
          className="pointer-events-none absolute -right-6 -bottom-6 h-[115%] w-1/2 object-cover mix-blend-multiply transition-transform duration-300 [mask-image:linear-gradient(to_right,transparent,black_30%)] group-hover:scale-105"
        />
      ) : (
        <span aria-hidden="true" className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-background/70 md:size-56" />
      )}
    </button>
  );
}