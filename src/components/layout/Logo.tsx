import { Link } from "react-router-dom";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 text-primary ${className}`} aria-label="Forme, home">
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
        <path d="M4.5 21V11a7.5 7.5 0 0 1 15 0v10z" fill="currentColor" />
      </svg>
      <span className="font-serif text-[1.75rem] leading-none tracking-tight">forme</span>
    </Link>
  );
}
