import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Category, PageMeta, Product, SortKey } from "@/types";

export const PAGE_SIZE = 9;

/** The API caps a page at 48 products. */
export const MAX_LIMIT = 48;

export interface CatalogParams {
  search?: string;
  category?: string;
  sort: SortKey;
  page: number;
  /** Products per page. Defaults to PAGE_SIZE. */
  limit?: number;
}

export function useProducts(params: CatalogParams) {
  const query = { ...params, limit: params.limit ?? PAGE_SIZE };
  return useQuery({
    queryKey: ["products", query],
    queryFn: () => api.get<{ data: Product[]; meta: PageMeta }>("/products", { params: query }),
    placeholderData: keepPreviousData, // keep the old page on screen while the next one loads
  });
}

/** One cached request that feeds the landing sections, carousels and "you might also like" rows. */
export function useAllProducts() {
  return useProducts({ sort: "rating_desc", page: 1, limit: MAX_LIMIT });
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
