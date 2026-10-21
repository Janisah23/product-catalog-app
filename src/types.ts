export type SortKey = "rating_desc" | "price_asc" | "price_desc";

export interface Product {
  id: string;
  title: string;
  description: string;
  brand: string;
  category: string;
  categoryName: string;
  price: number;
  originalPrice: number | null;
  discountPercentage: number;
  rating: number;
  stock: number;
  images: string[];
  thumbnail: string;
  specs: { label: string; value: string }[];
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Category {
  slug: string;
  name: string;
  count: number;
}

export interface CartLine {
  productId: string;
  quantity: number;
  lineTotal: number;
  product: Pick<Product, "id" | "title" | "brand" | "categoryName" | "price" | "originalPrice" | "thumbnail" | "stock">;
}

export interface Cart {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
}

export const MAX_LINE_QTY = 10;
