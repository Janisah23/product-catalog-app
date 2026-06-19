import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster } from "@/components/Toaster";
import { ApiError, api } from "@/lib/api";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth-store";
import CartPage from "@/pages/CartPage";
import CatalogPage from "@/pages/CatalogPage";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProductPage from "@/pages/ProductPage";
import RegisterPage from "@/pages/RegisterPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failures, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failures < 2,
    },
  },
});

/** Mirrors Firebase's signed-in user into the Zustand store and clears cached cart data on logout. */
function AuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser);
  useEffect(
    () =>
      onAuthStateChanged(auth, (fb) => {
        if (fb) {
          setUser({ uid: fb.uid, email: fb.email, displayName: fb.displayName });
          api.get("/me", { auth: true }).catch(() => undefined); // server verifies the token and syncs the profile
        } else {
          setUser(null);
          queryClient.removeQueries({ queryKey: ["cart"] });
        }
      }),
    [setUser],
  );
  return null;
}

function SetupNotice() {
  return (
    <main className="mx-auto max-w-xl px-5 py-24">
      <h1 className="font-serif text-4xl">Firebase isn't configured yet</h1>
      <p className="mt-4 text-muted-foreground">
        Copy <code>.env.example</code> to <code>.env</code>, fill in the <code>VITE_FIREBASE_*</code> values from your Firebase web app settings, then restart <code>npm run dev</code>.
      </p>
    </main>
  );
}

export default function App() {
  if (!isFirebaseConfigured) return <SetupNotice />;
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthBootstrap />
        <Routes>
            {/* No navbar */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

          <Route element={<Layout />}>
            <Route index element={<CatalogPage />} />
            <Route path="product/:id" element={<ProductPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="cart" element={<CartPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
