import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function pageList(current: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1]! > 1 ? ["gap" as const, p] : [p]));
}

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  const items = useMemo(() => pageList(page, totalPages), [page, totalPages]);
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1">
      <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft /> Previous
      </Button>
      {items.map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground" aria-hidden="true">
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? "default" : "ghost"}
            size="icon-sm"
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onChange(item)}
          >
            {item}
          </Button>
        ),
      )}
      <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next <ChevronRight />
      </Button>
    </nav>
  );
}
