import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/stores/toast-store";
import type { Cart } from "@/types";

export const cartKey = ["cart"] as const;

export function useCart() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: cartKey,
    queryFn: async () => (await api.get<{ data: Cart }>("/cart", { auth: true })).data,
    enabled: Boolean(user),
  });
}

/** Each mutation returns the full, server-calculated cart, which replaces the cached copy. */
export function useCartMutations() {
  const qc = useQueryClient();
  const onSuccess = (res: { data: Cart }) => qc.setQueryData(cartKey, res.data);
  const onError = (err: unknown) => {
    toast(errorMessage(err), "error");
    qc.invalidateQueries({ queryKey: cartKey });
  };

  const add = useMutation({
    mutationFn: (v: { productId: string; quantity: number }) => api.post<{ data: Cart }>("/cart/items", v, { auth: true }),
    onSuccess: (res) => {
      onSuccess(res);
      toast("Added to your cart");
    },
    onError,
  });

  const setQuantity = useMutation({
    mutationFn: (v: { productId: string; quantity: number }) =>
      api.patch<{ data: Cart }>(`/cart/items/${v.productId}`, { quantity: v.quantity }, { auth: true }),
    onSuccess,
    onError,
  });

  const remove = useMutation({
    mutationFn: (v: { productId: string }) => api.delete<{ data: Cart }>(`/cart/items/${v.productId}`, { auth: true }),
    onSuccess: (res) => {
      onSuccess(res);
      toast("Removed from your cart");
    },
    onError,
  });

  return { add, setQuantity, remove };
}
