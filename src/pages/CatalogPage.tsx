import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Search, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/Pagination";
import { Price } from "@/components/Price";
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

const NO_SCROLLBAR = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const chip = (active: boolean) =>
  cn(
    "h-10 shrink-0 rounded-full px-5 text-sm whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
    active ? "bg-primary text-primary-foreground" : "bg-card text-foreground/80 hover:bg-muted",
  );

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

  const [query, setQuery] = useState(search ?? "");
  useEffect(() => setQuery(search ?? ""), [search]);

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

  const filtersActive = Boolean(search || category);
  const showHero = !filtersActive && page === 1;
  const scrollToProducts = () => document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 pt-4 pb-16 md:space-y-6 md:px-6">
      {/* Search + categories */}
      <div className="space-y-3">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            update({ search: query.trim() || undefined });
            scrollToProducts();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lamps, mugs, throws"
              aria-label="Search products"
              className="h-12 w-full rounded-full bg-card pr-12 pl-11 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  update({ search: undefined });
                }}
                className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            aria-label="Search"
            className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Search className="size-5" />
          </button>
        </form>

        <nav aria-label="Categories" className={cn("-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0", NO_SCROLLBAR)}>
          <button type="button" onClick={() => update({ category: undefined })} aria-pressed={!category} className={chip(!category)}>
            All
          </button>
          {categories?.map((c) => (
            <button key={c.slug} type="button" onClick={() => update({ category: c.slug })} aria-pressed={c.slug === category} className={chip(c.slug === category)}>
              {c.name}
            </button>
          ))}
        </nav>
      </div>

      {showHero && <Hero onShop={scrollToProducts} />}

      {/* Products */}
      <section id="products" className="scroll-mt-4 space-y-5 pt-2">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{activeCategory ? activeCategory.name : search ? "Search results" : "All products"}</h2>
            <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
              {meta
                ? meta.total === 0
                  ? "No products found"
                  : `Showing ${first}-${last} of ${meta.total} ${meta.total === 1 ? "product" : "products"}${search ? ` for "${search}"` : ""}`
                : "Loading products"}
            </p>
          </div>
          <div role="group" aria-label="Sort products" className={cn("-mx-4 flex max-w-[100vw] gap-2 overflow-x-auto px-4 md:mx-0 md:px-0", NO_SCROLLBAR)}>
            {SORTS.map((s) => (
              <button
                key={s.value}
                type="button"
                aria-pressed={s.value === sort}
                onClick={() => update({ sort: s.value === "rating_desc" ? undefined : s.value })}
                className={chip(s.value === sort)}
              >
                {s.label}
              </button>
            ))}
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
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4" aria-busy="true">
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
            <ul className={cn("grid grid-cols-2 gap-x-3 gap-y-8 transition-opacity md:grid-cols-3 md:gap-x-5 lg:grid-cols-4", isPlaceholderData && "opacity-60")}>
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

/** Bento hero: top-rated product, one sale item, and a catalog count. Shares the default catalog query, so it costs no extra request. */
function Hero({ onShop }: { onShop: () => void }) {
  const { data, isPending } = useProducts({ search: undefined, category: undefined, sort: "rating_desc", page: 1 });
  const { data: categories } = useCategories();

  if (isPending) {
    return (
      <div className="grid gap-3 md:grid-cols-12 md:gap-4" aria-busy="true">
        <div className="h-96 animate-pulse rounded-3xl bg-muted md:col-span-7 md:row-span-2 md:h-[34rem]" />
        <div className="h-48 animate-pulse rounded-3xl bg-muted md:col-span-5" />
        <div className="h-32 animate-pulse rounded-3xl bg-muted md:col-span-5" />
      </div>
    );
  }

  const items = data?.data ?? [];
  const featured = items[0];
  if (!featured) return null;
  const deal = items.find((p) => p.id !== featured.id && p.discountPercentage > 0) ?? items[1];
  const total = categories?.reduce((sum, c) => sum + c.count, 0);

  return (
    <section aria-label="Featured" className="grid gap-3 md:grid-cols-12 md:gap-4">
      {/* Featured */}
      <article className="flex flex-col gap-6 overflow-hidden rounded-3xl bg-muted p-5 sm:flex-row md:col-span-7 md:row-span-2 md:p-8">
        <div className="flex flex-1 flex-col justify-between gap-8">
          <div>
            <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">Objects for a quieter home.</h1>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground md:text-base">
              Ceramics, lighting, textiles and furniture from small studios. Chosen to be used every day, and made to last.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4">
            <Link
              to={`/product/${featured.id}`}
              className="flex items-center gap-5 rounded-2xl bg-white/60 p-4 backdrop-blur-md transition-colors hover:bg-white/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            >
              <div>
                <p className="text-xs text-muted-foreground">{featured.title}</p>
                <Price price={featured.price} originalPrice={featured.originalPrice} className="mt-1" />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-xs font-medium">
                <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                {featured.rating.toFixed(1)}
              </span>
            </Link>
            <Button onClick={onShop} className="h-11 rounded-full px-6">
              Shop now
            </Button>
          </div>
        </div>
        <Link
          to={`/product/${featured.id}`}
          tabIndex={-1}
          aria-hidden="true"
          className="mx-auto block aspect-[4/5] w-full max-w-xs overflow-hidden rounded-3xl sm:mx-0 sm:aspect-auto sm:w-56 sm:max-w-none lg:w-72"
        >
          <img src={featured.thumbnail} alt="" className="size-full object-cover" />
        </Link>
      </article>

      {/* Deal */}
      {deal && (
        <article className="flex items-center gap-4 overflow-hidden rounded-3xl bg-muted p-5 md:col-span-5 md:p-6">
          <div className="min-w-0 flex-1">
            <span className="rounded-full bg-card px-3 py-1 text-[11px] text-muted-foreground">{deal.discountPercentage > 0 ? "Great value" : "Also loved"}</span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{deal.discountPercentage > 0 ? `Save ${deal.discountPercentage}%` : deal.title}</h2>
            <p className="mt-1 truncate text-sm text-muted-foreground">{deal.discountPercentage > 0 ? deal.title : deal.categoryName}</p>
            <Link
              to={`/product/${deal.id}`}
              className="mt-4 inline-flex items-center gap-1.5 border-b border-foreground/30 pb-0.5 text-xs font-medium hover:border-foreground"
            >
              View product <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <Link to={`/product/${deal.id}`} tabIndex={-1} aria-hidden="true" className="block aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-2xl sm:w-36">
            <img src={deal.thumbnail} alt="" loading="lazy" className="size-full object-cover" />
          </Link>
        </article>
      )}

      {/* Count */}
      <article className="flex items-center justify-between gap-4 rounded-3xl bg-primary p-5 text-primary-foreground md:col-span-5 md:p-6">
        <div>
          <p className="text-4xl font-semibold tabular-nums">{total ?? "-"}</p>
          <p className="mt-1 text-sm opacity-80">pieces from small studios, in {categories?.length ?? 0} categories.</p>
        </div>
        <button
          type="button"
          onClick={onShop}
          aria-label="Browse all products"
          className="grid size-12 shrink-0 place-items-center rounded-full bg-background text-foreground transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:outline-none"
        >
          <ArrowUpRight className="size-5" />
        </button>
      </article>
    </section>
  );
}