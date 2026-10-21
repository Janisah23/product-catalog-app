import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthShell, Field } from "@/pages/AuthForm";
import { usePageTitle } from "@/hooks/use-page-title";
import { authErrorMessage, signUp } from "@/lib/auth-actions";
import { useAuthStore } from "@/stores/auth-store";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  usePageTitle("Create account");
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string; search?: string } } | null)?.from;
  const destination = from ? `${from.pathname}${from.search ?? ""}` : "/";

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form | "form", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  if (user && !submitting) return <Navigate to={destination} replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (form.name.trim().length < 2) next.name = "Enter your name.";
    if (!EMAIL.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (form.confirm !== form.password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await signUp(form.name.trim(), form.email.trim(), form.password);
      navigate(destination, { replace: true });
    } catch (err) {
      setErrors({ form: authErrorMessage(err) });
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Create an account" intro="Save a cart that follows you across devices." footer={<>Already have an account? <Link to="/login" state={location.state} className="text-foreground underline underline-offset-4">Log in</Link></>}>
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Field id="name" label="Name" value={form.name} onChange={set("name")} error={errors.name} autoComplete="name" />
        <Field id="email" label="Email" type="email" value={form.email} onChange={set("email")} error={errors.email} autoComplete="email" />
        <Field id="password" label="Password" type="password" value={form.password} onChange={set("password")} error={errors.password} autoComplete="new-password" hint="At least 8 characters." />
        <Field id="confirm" label="Confirm password" type="password" value={form.confirm} onChange={set("confirm")} error={errors.confirm} autoComplete="new-password" />
        {errors.form && (
          <p role="alert" className="text-sm font-medium text-sale-text">
            {errors.form}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
