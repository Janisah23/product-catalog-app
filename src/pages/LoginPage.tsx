import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthShell, Field } from "@/pages/AuthForm";
import { usePageTitle } from "@/hooks/use-page-title";
import { authErrorMessage, logIn } from "@/lib/auth-actions";
import { useAuthStore } from "@/stores/auth-store";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  usePageTitle("Log in");
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string; search?: string } } | null)?.from;
  const destination = from ? `${from.pathname}${from.search ?? ""}` : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={destination} replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!EMAIL.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await logIn(email.trim(), password);
      navigate(destination, { replace: true });
    } catch (err) {
      setErrors({ form: authErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Log in" intro="Welcome back. Your cart is saved to your account." footer={<>New to Forme? <Link to="/register" state={location.state} className="text-foreground underline underline-offset-4">Create an account</Link></>}>
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Field id="email" label="Email" type="email" value={email} onChange={setEmail} error={errors.email} autoComplete="email" />
        <Field id="password" label="Password" type="password" value={password} onChange={setPassword} error={errors.password} autoComplete="current-password" />
        {errors.form && (
          <p role="alert" className="text-sm font-medium text-sale-text">
            {errors.form}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthShell>
  );
}
