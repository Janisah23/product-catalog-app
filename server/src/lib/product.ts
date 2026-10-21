import type { DocumentData, DocumentSnapshot } from 'firebase-admin/firestore';

export interface ProductSpec {
  label: string;
  value: string;
}

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
  specs: ProductSpec[];
}

/** Public product shape. Internal fields such as searchKeywords never leave the server. */
export function toProduct(doc: DocumentSnapshot<DocumentData>): Product {
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    title: d.title,
    description: d.description,
    brand: d.brand,
    category: d.category,
    categoryName: d.categoryName,
    price: d.price,
    originalPrice: d.originalPrice ?? null,
    discountPercentage: d.discountPercentage ?? 0,
    rating: d.rating,
    stock: d.stock,
    images: d.images ?? [],
    thumbnail: d.thumbnail ?? d.images?.[0] ?? '',
    specs: d.specs ?? [],
  };
}
