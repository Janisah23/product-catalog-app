import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-sm border border-input bg-card px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground hover:border-foreground/40 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-sale",
        className
      )}
      {...props}
    />
  )
}

export { Input }
