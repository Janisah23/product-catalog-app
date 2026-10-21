import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Price } from "@/components/Price";
import { QuantityStepper } from "@/components/QuantityStepper";
import { StateMessage } from "@/components/StateMessage";
import { useCart, useCartMutations } from "@/hooks/use-cart";
import { usePageTitle } from "@/hooks/use-page-title";
import { errorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { MAX_LINE_QTY } from "@/types";

export default function CartPage() {
  usePageTitle("Your cart");
  const { data: cart, isPending, isError, error, refetch } = useCart();
  const { setQuantity, remove } = useCartMutations();
  const busy = setQuantity.isPending || remove.isPending;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <h1 className="font-serif text-4xl md:text-5xl">Your cart</h1>

      {isPending ? (
        <div className="mt-10 space-y-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isError ? (
        <StateMessage title="We couldn't load your cart" action={<Button onClick={() => refetch()}>Try again</Button>}>
          {errorMessage(error)}
        </StateMessage>
      ) : cart.items.length === 0 ? (
        <StateMessage title="Your cart is empty" action={<Link to="/" className={buttonVariants()}>Browse the catalog</Link>}>
          Add something from the catalog and it will be here next time you log in.
        </StateMessage>
      ) : (
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden md:table-cell">Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Remove</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map((line) => (
                  <TableRow key={line.productId}>
                    <TableCell>
                      <div className="flex min-w-48 items-center gap-4">
                        <Link to={`/product/${line.productId}`} className="block w-16 shrink-0 overflow-hidden bg-secondary">
                          <img src={line.product.thumbnail} alt="" className="aspect-[4/5] size-full object-cover" />
                        </Link>
                        <div>
                          <Link to={`/product/${line.productId}`} className="font-medium underline-offset-4 hover:underline">
                            {line.product.title}
                          </Link>
                          <p className="text-sm text-muted-foreground">{line.product.brand}</p>
                          <Price price={line.product.price} originalPrice={line.product.originalPrice} className="mt-1 md:hidden" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Price price={line.product.price} originalPrice={line.product.originalPrice} />
                    </TableCell>
                    <TableCell>
                      <QuantityStepper
                        value={line.quantity}
                        max={Math.min(line.product.stock, MAX_LINE_QTY)}
                        label={line.product.title}
                        disabled={busy}
                        onChange={(quantity) => setQuantity.mutate({ productId: line.productId, quantity })}
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatPrice(line.lineTotal)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-sm" aria-label={`Remove ${line.product.title} from cart`} disabled={busy} onClick={() => remove.mutate({ productId: line.productId })}>
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Items</dt>
                  <dd className="tabular-nums" data-testid="summary-items">{cart.itemCount}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums" data-testid="summary-subtotal">{formatPrice(cart.subtotal)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm text-muted-foreground">Shipping and taxes are not included.</p>
              <Link to="/" className={buttonVariants({ variant: "outline", className: "mt-6 w-full" })}>
                Continue browsing
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
