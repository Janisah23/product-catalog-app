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
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> All products
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <section aria-label="Product images">
          <div className="aspect-[4/5] overflow-hidden bg-secondary">
            <img src={product.images[active]} alt={`${product.title}, view ${active + 1} of ${product.images.length}`} className="size-full object-cover" />
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
                    className={cn("block aspect-[4/5] w-full overflow-hidden border bg-secondary", i === active ? "border-primary" : "border-border opacity-80 hover:opacity-100")}
                  >
                    <img src={src} alt="" className="size-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:pt-2">
          <p className="text-sm text-muted-foreground">
            <Link to={`/?category=${product.category}`} className="underline-offset-4 hover:underline">
              {product.categoryName}
            </Link>
            {" by "}
            {product.brand}
          </p>
          <h1 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">{product.title}</h1>
          <div className="mt-4">
            <Stars rating={product.rating} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Price price={product.price} originalPrice={product.originalPrice} size="lg" />
            {product.discountPercentage > 0 && <Badge variant="sale">{product.discountPercentage}% off</Badge>}
          </div>

          <p className="mt-3 flex items-center gap-2 text-sm" data-testid="stock-status">
            <span className={cn("size-2 rounded-full", soldOut ? "bg-sale" : low ? "bg-sale" : "bg-primary")} aria-hidden="true" />
            {soldOut ? "Out of stock" : low ? `Only ${product.stock} left in stock` : "In stock"}
          </p>

          <p className="mt-6 max-w-prose leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {!soldOut && <QuantityStepper value={quantity} max={maxQty} onChange={setQuantity} label={product.title} disabled={add.isPending} />}
            <Button size="lg" className="min-w-48 flex-1 sm:flex-none" onClick={addToCart} disabled={soldOut || add.isPending}>
              {soldOut ? "Sold out" : add.isPending ? "Adding…" : user ? "Add to cart" : "Log in to add to cart"}
            </Button>
          </div>
          {add.isSuccess && (
            <p className="mt-3 text-sm">
              <Link to="/cart" className="underline underline-offset-4">
                View your cart
              </Link>
            </p>
          )}

          <h2 className="mt-12 mb-2 font-serif text-2xl">Details</h2>
          <dl className="border-t border-border text-sm">
            {[{ label: "Brand", value: product.brand }, { label: "Category", value: product.categoryName }, ...product.specs].map((row) => (
              <div key={row.label} className="grid grid-cols-[8rem_1fr] gap-4 border-b border-border py-3">
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
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:px-8 lg:grid-cols-2 lg:gap-16" aria-busy="true">
      <Skeleton className="aspect-[4/5]" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-1/2" />
      </div>
    </div>
  );
}
