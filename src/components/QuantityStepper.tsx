import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
}

export function QuantityStepper({ value, min = 1, max, onChange, label, disabled }: Props) {
  return (
    <div className="inline-flex items-center rounded-sm border border-input bg-card" role="group" aria-label={`Quantity for ${label}`}>
      <Button variant="ghost" size="icon-sm" aria-label={`Decrease quantity of ${label}`} disabled={disabled || value <= min} onClick={() => onChange(value - 1)}>
        <Minus />
      </Button>
      <output className="w-9 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </output>
      <Button variant="ghost" size="icon-sm" aria-label={`Increase quantity of ${label}`} disabled={disabled || value >= max} onClick={() => onChange(value + 1)}>
        <Plus />
      </Button>
    </div>
  );
}
