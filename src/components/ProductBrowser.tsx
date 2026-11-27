import { useCallback, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Pagination } from "@/components/Pagination";
import { ProductGrid, ProductGridSkeleton } from "@/components/ProductGrid";
import { StateMessage } from "@/components/StateMessage";
import { PAGE_SIZE, useProducts } from "@/hooks/use-catalog";
import { errorMessage } from "@/lib/api";
import { SORTS } from "@/lib/sorts";
import type { SortKey } from "@/types";

interface Props {
  /** Category slug. Leave out for the whole catalog. */
  category?: string;
  categoryName?: string;
  columns?: 3 | 4;
  id?: string;
}

/**
 * Result count, sort, product grid and pagination, driven by the URL (?search=&sort=&page=).
 * The catalog and every category page use this same component, so they behave the same way.
 */
export function ProductBrowser({ category, categoryName, columns = 3, id = "products" }: Props) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search")?.trim() || undefined;
  const sortParam = params.get("sort");
  const sort: SortKey = SORTS.some((s) => s.value === sortParam) ? (sortParam as SortKey) : "rating_desc";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const { data, isPending, isError, error, refetch, isFetching, isPlaceholderData } = useProducts({ search, category, sort, page });

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

  // Bring the top of the grid back into view when the page changes, but not on first load.
  const section = useRef<HTMLElement>(null);
  const seenPage = useRef(page);
  useEffect(() => {
    if (seenPage.current !== page) {
      seenPage.current = page;
      section.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page]);

  const meta = data?.meta;
  const first = meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const last = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;
  const scope = categoryName ? ` in ${categoryName}` : "";

  return (
    <section id={id} ref={section} className="scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {meta
              ? meta.total === 0
                ? "No products found"
                : `Showing ${first}-${last} of ${meta.total} ${meta.total === 1 ? "product" : "products"}${scope}`
              : "Loading products"}
          </p>
          {search && (
            <button
              type="button"
              onClick={() => update({ search: undefined })}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-secondary px-3 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/70"
            >
              Search: {search}
              <X className="size-3.5" aria-label="Clear search" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor={`${id}-sort`} className="text-muted-foreground">
            Sort by
          </label>
          <select
            id={`${id}-sort`}
            value={sort}
            onChange={(e) => update({ sort: e.target.value === "rating_desc" ? undefined : e.target.value })}
            className="h-10 rounded-full border border-input bg-card px-4 text-sm hover:border-foreground/40"
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
          title="We couldn't load the products"
          action={
            <Button onClick={() => refetch()} disabled={isFetching}>
              Try again
            </Button>
          }
        >
          {errorMessage(error)}
        </StateMessage>
      ) : isPending ? (
        <ProductGridSkeleton count={PAGE_SIZE} columns={columns} />
      ) : data.data.length === 0 ? (
        <StateMessage
          title="Nothing matches yet"
          action={
            search ? (
              <Button variant="outline" onClick={() => update({ search: undefined })}>
                Clear search
              </Button>
            ) : (
              <Link to="/" className={buttonVariants({ variant: "outline" })}>
                Browse the catalog
              </Link>
            )
          }
        >
          {search ? `We couldn't find anything for "${search}"${scope}. Try a shorter word or another category.` : "There are no products here yet."}
        </StateMessage>
      ) : (
        <>
          <ProductGrid products={data.data} columns={columns} dimmed={isPlaceholderData} />
          <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={(p) => update({ page: p === 1 ? undefined : String(p) })} />
        </>
      )}
    </section>
  );
}
