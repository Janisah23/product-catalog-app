import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Price } from "@/components/Price";
import { ProductCard } from "@/components/ProductCard";
import { QuantityStepper } from "@/components/QuantityStepper";
import { StateMessage } from "@/components/StateMessage";
import { useCartMutations } from "@/hooks/use-cart";
import { useProduct, useProducts } from "@/hooks/use-catalog";
import { usePageTitle } from "@/hooks/use-page-title";
import { ApiError, errorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { MAX_LINE_QTY, type Product } from "@/types";
import { cn } from "cn";

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
  const [active, setActive] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const { add } = useCartMutations();
  const { data: related } = useProducts({ search: undefined, category: product.category, sort: "rating_desc", page: 1 });
  const more = related?.data.filter((p) => p.id !== product.id).slice(0, 4) ?? [];

  const soldOut = product.stock === 0;
  const maxQty = Math.min(product.stock, MAX_LINE_QTY);
  const low = product.stock > 0 && product.stock <= 5;
  const count = product.images.length;
  const step = (dir: 1 | -1) => setActive((i) => (i + dir + count) % count);

  function addToCart() {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    add.mutate({ productId: product.id, quantity });
  }

  return (
    <div className="mx-auto max-w-7xl pb-16 lg:px-6 lg:pt-4">
      {/* Breadcrumb (desktop) */}
      <nav aria-label="Breadcrumb" className="mb-5 hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/?category=${product.category}`} className="hover:text-foreground">{product.categoryName}</Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
        {/* Gallery */}
        <section aria-label="Product images" className="relative bg-gradient-to-b from-muted to-background px-4 pt-4 pb-10 lg:rounded-3xl lg:bg-none lg:p-0 lg:pb-0">
          <Link
            to="/"
            aria-label="Back to all products"
            className="absolute top-4 left-4 z-10 grid size-10 place-items-center rounded-full bg-card shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none lg:hidden"
          >
            <ChevronLeft className="size-5" />
          </Link>

          <div className="mx-auto aspect-[4/5] max-h-[26rem] overflow-hidden rounded-3xl bg-muted lg:max-h-none">
            <img src={product.images[active]} alt={`${product.title}, view ${active + 1} of ${count}`} className="size-full object-cover" />
          </div>

          {count > 1 && (
            <>
              <div className="mt-4 flex justify-center sm:hidden">
                <div className="flex items-center gap-1 rounded-full bg-card p-1 shadow-sm">
                  <button type="button" onClick={() => step(-1)} aria-label="Previous image" className="grid size-8 place-items-center rounded-full hover:bg-muted">
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="px-1 text-xs tabular-nums text-muted-foreground" aria-live="polite">
                    {active + 1} / {count}
                  </span>
                  <button type="button" onClick={() => step(1)} aria-label="Next image" className="grid size-8 place-items-center rounded-full hover:bg-muted">
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
              <ul className="mt-4 hidden grid-cols-3 gap-3 sm:grid">
                {product.images.map((src, i) => (
                  <li key={src}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`Show image ${i + 1}`}
                      aria-pressed={i === active}
                      className={cn(
                        "block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted ring-2 transition focus-visible:outline-none focus-visible:ring-primary",
                        i === active ? "ring-primary" : "opacity-70 ring-transparent hover:opacity-100",
                      )}
                    >
                      <img src={src} alt="" className="size-full object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* Info sheet */}
        <section className="relative -mt-6 rounded-t-3xl bg-card p-5 shadow-sm sm:p-8 lg:mt-0 lg:rounded-3xl lg:p-10">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl leading-tight font-semibold tracking-tight md:text-4xl">{product.title}</h1>
            <span className="flex shrink-0 items-center gap-1.5 rounded-xl bg-muted px-3 py-1.5 text-sm font-medium">
              <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span className="sr-only">Rating</span>
              {product.rating.toFixed(1)}
            </span>
          </div>

          <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            <Link to={`/?category=${product.category}`} className="hover:text-foreground">
              {product.categoryName}
            </Link>
            <span aria-hidden="true">•</span>
            <span>{product.brand}</span>
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Price price={product.price} originalPrice={product.originalPrice} size="lg" />
            {product.discountPercentage > 0 && (
              <Badge variant="sale" className="rounded-full px-3">
                Save {product.discountPercentage}%
              </Badge>
            )}
          </div>

          <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground md:text-base">{product.description}</p>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-6">
            <div>
              <p className="font-medium">Quantity</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground" data-testid="stock-status">
                <span className={cn("size-2 rounded-full", soldOut || low ? "bg-sale" : "bg-primary")} aria-hidden="true" />
                {soldOut ? "Out of stock" : low ? `Only ${product.stock} left` : "In stock, ready to ship"}
              </p>
            </div>
            {!soldOut && <QuantityStepper value={quantity} max={maxQty} onChange={setQuantity} label={product.title} disabled={add.isPending} />}
          </div>

          <Button size="lg" className="mt-6 h-14 w-full rounded-full text-base" onClick={addToCart} disabled={soldOut || add.isPending}>
            {soldOut ? "Sold out" : add.isPending ? "Adding…" : user ? "Add to cart" : "Log in to add to cart"}
          </Button>
          {add.isSuccess && (
            <p className="mt-3 text-center text-sm">
              <Link to="/cart" className="border-b border-foreground/30 pb-0.5 font-medium hover:border-foreground">
                View your cart →
              </Link>
            </p>
          )}

          <details open className="group mt-8 rounded-2xl bg-muted px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium [&::-webkit-details-marker]:hidden">
              Details
              <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <dl className="mt-3 divide-y divide-border/70 text-sm">
              {[{ label: "Brand", value: product.brand }, { label: "Category", value: product.categoryName }, ...product.specs].map((row) => (
                <div key={row.label} className="grid grid-cols-[7rem_1fr] gap-4 py-3">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </details>
        </section>
      </div>

      {/* More products */}
      {more.length > 0 && (
        <section aria-labelledby="more-heading" className="mt-12 px-4 lg:px-0">
          <div className="mb-5 flex items-center justify-between">
            <h2 id="more-heading" className="text-xl font-semibold tracking-tight">
              More products
            </h2>
            <Link to={`/?category=${product.category}`} className="border-b border-foreground/30 pb-0.5 text-xs font-medium hover:border-foreground">
              View all →
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-5 lg:grid-cols-4">
            {more.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-2 lg:gap-10 lg:px-6 lg:pt-4" aria-busy="true">
      <div className="px-4 pt-4 pb-10 lg:p-0">
        <Skeleton className="mx-auto aspect-[4/5] max-h-[26rem] rounded-3xl lg:max-h-none" />
      </div>
      <div className="-mt-6 space-y-4 rounded-t-3xl bg-card p-5 lg:mt-0 lg:rounded-3xl lg:p-10">
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-14 w-full rounded-full" />
      </div>
    </div>
  );
}