import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export function AuthShell({
  title,
  intro,
  footer,
  backTo,
  children,
}: {
  title: string;
  intro?: string;
  footer?: ReactNode;
  backTo?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-black lg:flex-row">
      {/* Pattern panel */}
      <aside className="relative h-60 overflow-hidden lg:h-auto lg:flex-1">
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <pattern id="auth-pattern" width="160" height="160" patternUnits="userSpaceOnUse">
              <rect width="160" height="160" fill="#0b0b0b" />
              <path d="M0 0H80A80 80 0 0 1 0 80Z" fill="#1b1b1b" />
              <circle cx="120" cy="40" r="40" fill="#151515" />
              <path d="M80 160L160 160L160 80Z" fill="#222222" />
              <path d="M0 120A40 40 0 0 1 40 160H0Z" fill="#181818" />
              <polygon points="100,80 120,100 100,120 80,100" fill="#262626" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-pattern)" />
        </svg>

        {backTo && (
          <Link
            to={backTo}
            aria-label="Back"
            className="absolute left-6 top-6 z-10 text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
        )}

        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 pb-10 lg:pb-0">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg lg:h-28 lg:w-28 lg:rounded-3xl">
            <svg viewBox="0 0 24 24" className="h-9 w-9 lg:h-14 lg:w-14" aria-hidden="true">
              <path d="M12 3H21V12A9 9 0 1 1 12 3Z" fill="#000" />
            </svg>
          </div>
            <span className="font-['DM_Serif_Display',serif] text-4xl leading-none tracking-tight text-[#F8F7F4] lg:text-5xl">            
              forme
          </span>
        </div>
      </aside>

      {/* Form sheet */}
      <main className="relative -mt-14 flex flex-1 flex-col justify-center rounded-t-[3.5rem] bg-white px-6 py-12 sm:px-12 lg:mt-0 lg:-ml-24 lg:rounded-l-[6rem] lg:rounded-tr-none lg:px-24">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-center font-['DM_Serif_Display',serif] text-5xl leading-none tracking-tight text-[#20211F]">
            {title}
          </h1>          
          {intro && <p className="mt-3 text-center text-sm text-neutral-500">{intro}</p>}
          <div className="mt-10">{children}</div>
          {footer && <p className="mt-12 text-center text-sm text-neutral-800">{footer}</p>}
        </div>
      </main>
    </div>
  );
}

export function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  hint,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && show ? "text" : type;

  return (
    <div>
      <div
        className={`flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-[0_8px_28px_rgba(0,0,0,0.07)] transition-shadow focus-within:shadow-[0_8px_28px_rgba(0,0,0,0.14)] ${
          error ? "ring-1 ring-red-500" : ""
        }`}
      >
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className="block text-sm text-black">
            {label}
          </label>
          <input
            id={id}
            type={inputType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete={autoComplete}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={error || hint ? `${id}-note` : undefined}
            className="mt-1 w-full bg-transparent text-sm text-neutral-700 outline-none placeholder:text-neutral-400 [&::-ms-clear]:hidden [&::-ms-reveal]:hidden"
          />
        </div>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="shrink-0 rounded-md p-1 text-neutral-400 outline-none transition-colors hover:text-black focus-visible:text-black focus-visible:ring-2 focus-visible:ring-black/40"
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>

      {(error || hint) && (
        <p
          id={`${id}-note`}
          className={`mt-2 px-2 text-xs ${error ? "font-medium text-sale-text" : "text-neutral-500"}`}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}