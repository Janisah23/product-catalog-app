import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Category, PageMeta, Product, SortKey } from "@/types";

export const PAGE_SIZE = 9;

export interface CatalogParams {
  search?: string;
  category?: string;
  sort: SortKey;
  page: number;
}

export function useProducts(params: CatalogParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () =>
      api.get<{ data: Product[]; meta: PageMeta }>("/products", { params: { ...params, limit: PAGE_SIZE } }),
    placeholderData: keepPreviousData, // keep the old page on screen while the next one loads
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => (await api.get<{ data: Product }>(`/products/${id}`)).data,
    enabled: Boolean(id),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get<{ data: Category[] }>("/categories")).data,
    staleTime: 10 * 60 * 1000,
  });
}
