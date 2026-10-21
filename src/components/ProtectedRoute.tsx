import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";

export function ProtectedRoute() {
  const { user, status } = useAuthStore();
  const location = useLocation();
  if (status === "loading") {
    return <p className="py-24 text-center text-muted-foreground">Loading your account…</p>;
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
