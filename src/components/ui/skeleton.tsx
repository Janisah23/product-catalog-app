import * as React from "react"
import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("rounded-xl bg-secondary motion-safe:animate-pulse", className)}
      {...props}
    />
  )
}

export { Skeleton }
