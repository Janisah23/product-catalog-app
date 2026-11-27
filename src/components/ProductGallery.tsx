import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { cn } from "cn";

/** Large photo with a progress bar, previous/next buttons and a thumbnail row. */
export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const count = images.length;
  const step = (dir: 1 | -1) => setActive((i) => (i + dir + count) % count);
  const arrow = "absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none";

  return (
    <section aria-label="Product images" className="min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
        <ProductImage src={images[active]} alt={`${title}, photo ${active + 1} of ${count}`} priority />
        {count > 1 && (
          <>
            <div className="absolute inset-x-4 top-4 flex gap-1.5" role="group" aria-label="Choose photo">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === active}
                  className="group/bar h-4 flex-1 py-1.5"
                >
                  <span className={cn("block h-1 rounded-full transition-colors", i === active ? "bg-foreground" : "bg-foreground/20 group-hover/bar:bg-foreground/40")} />
                </button>
              ))}
            </div>
            <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className={cn(arrow, "left-3")}>
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next photo" className={cn(arrow, "right-3")}>
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className={cn("mt-3 grid gap-3", count <= 3 ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-4")}>
          {images.map((src, i) => (
            <li key={`${src}-${i}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-pressed={i === active}
                className={cn(
                  "relative block aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted ring-2 ring-offset-2 ring-offset-background transition focus-visible:outline-none focus-visible:ring-primary",
                  i === active ? "ring-primary" : "opacity-70 ring-transparent hover:opacity-100",
                )}
              >
                <ProductImage src={src} alt="" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
