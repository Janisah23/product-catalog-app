import { Fragment } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export interface Crumb {
  label: string;
  to?: string;
}

/** Back button plus a trail. Back returns to the previous page in this app, or to `backTo` when the page was opened directly. */
export function Breadcrumb({ items, backTo = "/" }: { items: Crumb[]; backTo?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = () => (location.key !== "default" ? navigate(-1) : navigate(backTo));

  return (
    <div className="flex items-center gap-3 text-sm">
      <button
        type="button"
        onClick={goBack}
        aria-label="Go back"
        className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card transition-colors hover:border-foreground/40"
      >
        <ArrowLeft className="size-4" />
      </button>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
          {items.map((item, i) => (
            <Fragment key={`${item.label}-${i}`}>
              {i > 0 && (
                <li aria-hidden="true" className="select-none">
                  /
                </li>
              )}
              <li className={i === items.length - 1 ? "max-w-[14rem] truncate text-foreground sm:max-w-none" : undefined}>
                {item.to && i < items.length - 1 ? (
                  <Link to={item.to} className="underline-offset-4 hover:text-foreground hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={i === items.length - 1 ? "page" : undefined}>{item.label}</span>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>
    </div>
  );
}
