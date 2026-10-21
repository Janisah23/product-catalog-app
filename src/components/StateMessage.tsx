import type { ReactNode } from "react";

export function StateMessage({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <h2 className="font-serif text-3xl">{title}</h2>
      {children && <p className="mt-3 text-muted-foreground">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
