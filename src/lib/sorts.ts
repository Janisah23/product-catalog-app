import type { SortKey } from "@/types";

export const SORTS: { value: SortKey; label: string }[] = [
  { value: "rating_desc", label: "Top rated" },
  { value: "price_asc", label: "Price, low to high" },
  { value: "price_desc", label: "Price, high to low" },
];
