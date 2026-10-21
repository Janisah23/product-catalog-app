import { X } from "lucide-react";
import { useToastStore } from "@/stores/toast-store";
import { cn } from "cn";

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-center gap-3 rounded-sm py-3 pr-2 pl-4 text-sm shadow-sm",
            t.tone === "error" ? "bg-sale-text text-white" : "bg-primary text-primary-foreground",
          )}
        >
          <span>{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
            className="grid size-6 place-items-center rounded-sm hover:bg-white/15"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
