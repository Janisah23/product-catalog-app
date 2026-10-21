import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";

export function AuthShell({ title, intro, children, footer }: { title: string; intro: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-5 py-16 md:py-24">
      <h1 className="font-serif text-4xl md:text-5xl">{title}</h1>
      <p className="mt-3 text-muted-foreground">{intro}</p>
      <div className="mt-8 border border-border bg-card p-6 md:p-8">{children}</div>
      <p className="mt-6 text-sm text-muted-foreground">{footer}</p>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  hint?: string;
}

export function Field({ id, label, type = "text", value, onChange, error, autoComplete, hint }: FieldProps) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input id={id} name={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} aria-invalid={error ? true : undefined} aria-describedby={describedBy} />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-sale-text">
          {error}
        </p>
      )}
    </div>
  );
}
