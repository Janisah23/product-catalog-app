import { NavLink, useSearchParams } from "react-router-dom";
import { Package } from "lucide-react";
import { useCategories } from "@/hooks/use-catalog";
import { categoryIcon, categoryPath } from "@/lib/categories";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";

interface Props {
  /** "list" is the sidebar. "pills" is the horizontal toggle used on small screens and above product grids. */
  variant: "list" | "pills";
  className?: string;
}

/**
 * Every item is a real link: All products goes to the catalog and each category goes to its own page.
 * Search and sort carry over so switching category keeps what the shopper was doing.
 */
export function CategoryNavigation({ variant, className }: Props) {
  const { data: categories, isPending } = useCategories();
  const [params] = useSearchParams();
  const carried = new URLSearchParams();
  for (const key of ["search", "sort"]) {
    const value = params.get(key);
    if (value) carried.set(key, value);
  }
  const search = carried.size ? `?${carried}` : "";

  const items = [{ slug: "", name: "All products", count: categories?.reduce((sum, c) => sum + c.count, 0), to: `/${search}` }, ...(categories ?? []).map((c) => ({ ...c, to: `${categoryPath(c.slug)}${search}` }))];

  if (isPending) {
    return variant === "list" ? (
      <div className={cn("space-y-2", className)} aria-busy="true">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    ) : (
      <div className={cn("flex gap-2", className)} aria-busy="true">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-24 shrink-0 rounded-full" />
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <nav aria-label="Categories" className={className}>
        <p className="mb-3 px-3 text-sm font-medium">Category</p>
        <ul className="space-y-1">
          {items.map((c) => {
            const Icon = c.slug ? categoryIcon(c.slug) : Package;
            return (
              <li key={c.slug || "all"}>
                <NavLink
                  to={c.to}
                  end={!c.slug}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-secondary",
                    )
                  }
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1">{c.name}</span>
                  {c.count !== undefined && <span className="text-xs tabular-nums opacity-70">{c.count}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Categories" className={cn("relative -mx-5 overflow-x-auto px-5 no-scrollbar md:mx-0 md:overflow-visible md:px-0", className)}>
      <ul className="flex gap-2 md:flex-wrap">
        {items.map((c) => (
          <li key={c.slug || "all"} className="shrink-0">
            <NavLink
              to={c.to}
              end={!c.slug}
              className={({ isActive }) =>
                cn(
                  "inline-flex h-10 items-center rounded-full border px-5 text-sm whitespace-nowrap transition-colors",
                  isActive ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/80 hover:border-foreground/40",
                )
              }
            >
              {c.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
