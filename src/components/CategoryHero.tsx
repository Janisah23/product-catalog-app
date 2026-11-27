import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductImage } from "@/components/ProductImage";
import { useProducts } from "@/hooks/use-catalog";
import type { Category } from "@/types";

/** Category banner with the name set very large, plus a search box that filters this category. */
export function CategoryHero({ category }: { category: Category }) {
  const [params, setParams] = useSearchParams();
  const urlSearch = params.get("search") ?? "";
  const [query, setQuery] = useState(urlSearch);
  const [seen, setSeen] = useState(urlSearch);
  if (seen !== urlSearch) {
    setSeen(urlSearch);
    setQuery(urlSearch);
  }

  const { data } = useProducts({ category: category.slug, sort: "rating_desc", page: 1, limit: 1 });
  const top = data?.data[0];

  function submit(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (query.trim()) next.set("search", query.trim());
    else next.delete("search");
    next.delete("page");
    setParams(next);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <section aria-labelledby="category-title" className="relative overflow-hidden rounded-3xl bg-secondary">
        <div className="flex min-h-56 items-end justify-between gap-6 md:min-h-96">
          <h1
            id="category-title"
            className="px-6 pb-14 font-serif text-[18vw] leading-[0.9] tracking-tight text-primary select-none md:translate-y-[6%] md:px-12 md:pb-0 md:leading-[0.85] md:text-[9.5rem]"
          >
            {category.name}
          </h1>
          {top && (
            <Link
              to={`/product/${top.id}`}
              aria-label={`Top rated: ${top.title}`}
              className="relative mr-8 mb-12 hidden aspect-[4/5] w-60 shrink-0 self-end overflow-hidden rounded-2xl bg-card shadow-sm md:block lg:mr-12 lg:w-64"
            >
              <ProductImage src={top.thumbnail} alt={top.title} />
            </Link>
          )}
        </div>
      </section>

      <form
        role="search"
        onSubmit={submit}
        className="relative z-10 mx-3 -mt-7 flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border sm:flex-row sm:items-center sm:gap-4 md:mx-8 md:px-6"
      >
        <p className="font-serif text-xl sm:flex-1">
          {category.count} {category.count === 1 ? "piece" : "pieces"} in {category.name.toLowerCase()}
        </p>
        <div className="relative sm:w-80">
          <label htmlFor="category-search" className="sr-only">
            Search in {category.name}
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="category-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${category.name.toLowerCase()}`}
            className="h-11 pl-11 [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
        <Button type="submit" size="lg" className="h-11">
          Search
        </Button>
      </form>
    </div>
  );
}
