import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Disclosure } from "@/components/Disclosure";
import { Price } from "@/components/Price";
import { ProductActions } from "@/components/ProductActions";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductGrid } from "@/components/ProductGrid";
import { StateMessage } from "@/components/StateMessage";
import { Stars } from "@/components/Stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllProducts, useProduct } from "@/hooks/use-catalog";
import { usePageTitle } from "@/hooks/use-page-title";
import { ApiError, errorMessage } from "@/lib/api";
import { categoryPath } from "@/lib/categories";
import type { Product } from "@/types";

export default function ProductPage() {
  const { id } = useParams();
  const { data: product, isPending, isError, error, refetch } = useProduct(id);
  usePageTitle(product?.title);

  if (isPending) return <ProductSkeleton />;
  if (isError) {
    const missing = error instanceof ApiError && (error.status === 404 || error.status === 400);
    return (
      <StateMessage
        title={missing ? "We can't find that product" : "We couldn't load this product"}
        action={missing ? <Link to="/" className="underline underline-offset-4">Back to the catalog</Link> : <Button onClick={() => refetch()}>Try again</Button>}
      >
        {missing ? "It may have been removed." : errorMessage(error)}
      </StateMessage>
    );
  }
  return <ProductView key={product.id} product={product} />;
}

function ProductView({ product }: { product: Product }) {
  const { data } = useAllProducts();
  const related = useMemo(() => {
    const others = (data?.data ?? []).filter((p) => p.id !== product.id);
    const same = others.filter((p) => p.category === product.category);
    return [...same, ...others.filter((p) => p.category !== product.category)].slice(0, 4);
  }, [data, product.id, product.category]);

  const images = product.images.length ? product.images : product.thumbnail ? [product.thumbnail] : [];
  const rows = [{ label: "Brand", value: product.brand }, { label: "Category", value: product.categoryName }, ...product.specs];

  return (
    <div className="mx-auto max-w-7xl px-5 pt-6 pb-16 md:px-8">
      <Breadcrumb items={[{ label: "Catalog", to: "/" }, { label: product.categoryName, to: categoryPath(product.category) }, { label: product.title }]} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-14">
        <ProductGallery images={images} title={product.title} />

        <section className="min-w-0 lg:sticky lg:top-24">
          <Link
            to={categoryPath(product.category)}
            className="inline-flex h-8 items-center rounded-full border border-border bg-card px-3.5 text-xs transition-colors hover:border-foreground/40"
          >
            {product.categoryName}
          </Link>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">{product.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">by {product.brand}</p>

          <div className="mt-4">
            <Stars rating={product.rating} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Price price={product.price} originalPrice={product.originalPrice} size="lg" />
            {product.discountPercentage > 0 && <Badge variant="sale" className="h-7 px-3">Save {product.discountPercentage}%</Badge>}
          </div>

          <div className="mt-7">
            <ProductActions product={product} />
          </div>

          <div className="mt-8 space-y-3">
            <Disclosure title="Description" defaultOpen>
              <p className="leading-relaxed text-muted-foreground">{product.description}</p>
            </Disclosure>
            <Disclosure title="Specifications" defaultOpen>
              <dl className="divide-y divide-border">
                {rows.map((row) => (
                  <div key={row.label} className="grid grid-cols-[8rem_1fr] gap-4 py-3 first:pt-0 last:pb-0">
                    <dt className="text-muted-foreground">{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </Disclosure>
          </div>
        </section>
      </div>

      <section aria-label="Rating" className="mt-16 grid gap-6 rounded-3xl bg-secondary p-8 md:grid-cols-[auto_1fr] md:items-center md:gap-16 md:p-12">
        <p className="flex items-end gap-2">
          <span className="font-serif text-7xl leading-none md:text-8xl">{product.rating.toFixed(1)}</span>
          <span className="pb-2 text-muted-foreground">/ 5</span>
        </p>
        <div>
          <Stars rating={product.rating} />
          <p className="mt-2 text-sm text-muted-foreground">Average rating for the {product.title}.</p>
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-20">
          <h2 id="related-heading" className="mb-8 text-center font-serif text-4xl md:text-5xl">
            You might also like
          </h2>
          <ProductGrid products={related} variant="minimal" columns={4} />
        </section>
      )}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-6 md:px-8" aria-busy="true">
      <Skeleton className="h-9 w-64" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <Skeleton className="aspect-[4/5] rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-14 w-3/4" />
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-9 w-1/3" />
          <Skeleton className="h-14 w-full rounded-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
