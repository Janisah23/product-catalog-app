import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Price } from "@/components/Price";
import { QuantityStepper } from "@/components/QuantityStepper";
import { StateMessage } from "@/components/StateMessage";
import { Stars } from "@/components/Stars";
import { useCartMutations } from "@/hooks/use-cart";
import { useProduct } from "@/hooks/use-catalog";
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

  const soldOut = product.stock === 0;
  const maxQty = Math.min(product.stock, MAX_LINE_QTY);
  const low = product.stock > 0 && product.stock <= 5;

  function addToCart() {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    add.mutate({ productId: product.id, quantity });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 pt-4 pb-16 md:px-6">
      <Link
        to="/"
        className="inline-flex h-10 items-center gap-1 rounded-full bg-card px-4 text-sm text-muted-foreground shadow-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      >
        <ChevronLeft className="size-4" /> All products
      </Link>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Gallery */}
        <section aria-label="Product images" className="rounded-3xl bg-card p-3 shadow-sm md:p-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
            <img
              src={product.images[active]}
              alt={`${product.title}, view ${active + 1} of ${product.images.length}`}
              className="size-full object-cover mix-blend-multiply"
            />
            {product.discountPercentage > 0 && (
              <Badge variant="sale" className="absolute top-4 right-4 rounded-full">
                {product.discountPercentage}% off
              </Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <ul className="mt-3 grid grid-cols-4 gap-3">
              {product.images.map((src, i) => (
                <li key={src}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show image ${i + 1}`}
                    aria-pressed={i === active}
                    className={cn(
                      "block aspect-square w-full overflow-hidden rounded-2xl bg-muted ring-2 transition focus-visible:outline-none focus-visible:ring-primary",
                      i === active ? "ring-primary" : "ring-transparent opacity-70 hover:opacity-100",
                    )}
                  >
                    <img src={src} alt="" className="size-full object-cover mix-blend-multiply" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Info */}
        <section className="rounded-3xl bg-card p-6 shadow-sm md:p-10">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link
              to={`/?category=${product.category}`}
              className="rounded-full bg-muted px-3 py-1 text-xs text-foreground transition-colors hover:bg-muted/70"
            >
              {product.categoryName}
            </Link>
            <span>by {product.brand}</span>
          </div>
          <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight md:text-4xl">{product.title}</h1>
          <div className="mt-4">
            <Stars rating={product.rating} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Price price={product.price} originalPrice={product.originalPrice} size="lg" />
          </div>

          <p className="mt-3 flex items-center gap-2 text-sm" data-testid="stock-status">
            <span className={cn("size-2 rounded-full", soldOut || low ? "bg-sale" : "bg-primary")} aria-hidden="true" />
            {soldOut ? "Out of stock" : low ? `Only ${product.stock} left in stock` : "In stock"}
          </p>

          <p className="mt-6 max-w-prose leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {!soldOut && <QuantityStepper value={quantity} max={maxQty} onChange={setQuantity} label={product.title} disabled={add.isPending} />}
            <Button size="lg" className="min-w-48 flex-1 rounded-full sm:flex-none" onClick={addToCart} disabled={soldOut || add.isPending}>
              {soldOut ? "Sold out" : add.isPending ? "Adding…" : user ? "Add to cart" : "Log in to add to cart"}
            </Button>
          </div>
          {add.isSuccess && (
            <p className="mt-3 text-sm">
              <Link to="/cart" className="border-b border-foreground/30 pb-0.5 font-medium hover:border-foreground">
                View your cart →
              </Link>
            </p>
          )}

          <h2 className="mt-10 mb-3 text-lg font-medium tracking-tight">Details</h2>
          <dl className="divide-y divide-border overflow-hidden rounded-2xl bg-muted px-5 text-sm">
            {[{ label: "Brand", value: product.brand }, { label: "Category", value: product.categoryName }, ...product.specs].map((row) => (
              <div key={row.label} className="grid grid-cols-[8rem_1fr] gap-4 py-3">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-4 pt-4 md:px-6 lg:grid-cols-2" aria-busy="true">
      <Skeleton className="aspect-[4/5] rounded-3xl" />
      <div className="space-y-4 rounded-3xl bg-card p-10">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-1/2 rounded-full" />
      </div>
    </div>
  );
}