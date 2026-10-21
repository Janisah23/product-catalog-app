import { Router } from 'express';
import type { Query, DocumentData } from 'firebase-admin/firestore';
import { z } from 'zod';
import { productsCol, categoriesCol } from '../firebase.js';
import { notFound } from '../lib/errors.js';
import { toProduct } from '../lib/product.js';
import { splitQuery } from '../lib/search.js';

export const productsRouter = Router();
export const categoriesRouter = Router();

const SCAN_LIMIT = 500;

const listQuery = z.object({
  search: z.string().trim().max(80).optional(),
  category: z.string().trim().regex(/^[a-z0-9-]+$/, 'Invalid category').max(40).optional(),
  sort: z.enum(['rating_desc', 'price_asc', 'price_desc']).default('rating_desc'),
  page: z.coerce.number().int().min(1).max(500).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(9),
});

const SORTS = {
  rating_desc: ['rating', 'desc'],
  price_asc: ['price', 'asc'],
  price_desc: ['price', 'desc'],
} as const;

// GET /api/products?search=&category=&sort=&page=&limit=
productsRouter.get('/', async (req, res) => {
  const { search, category, sort, page, limit } = listQuery.parse(req.query);
  const { primary, extra } = splitQuery(search ?? '');

  let base: Query<DocumentData> = productsCol;
  if (category) base = base.where('category', '==', category);
  if (primary) base = base.where('searchKeywords', 'array-contains', primary);
  const [field, direction] = SORTS[sort];
  const ordered = base.orderBy(field, direction);

  let docs;
  let total: number;
  if (extra.length === 0) {
    // Common path: Firestore does the filtering, ordering, counting and paging.
    const [countSnap, snap] = await Promise.all([
      base.count().get(),
      ordered.offset((page - 1) * limit).limit(limit).get(),
    ]);
    total = countSnap.data().count;
    docs = snap.docs;
  } else {
    // Multi-word search: Firestore narrows by the longest word, remaining words are matched here.
    const snap = await ordered.limit(SCAN_LIMIT).get();
    const matches = snap.docs.filter((d) => {
      const keywords: string[] = d.get('searchKeywords') ?? [];
      return extra.every((t) => keywords.includes(t));
    });
    total = matches.length;
    docs = matches.slice((page - 1) * limit, page * limit);
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));
  res.json({
    data: docs.map(toProduct),
    meta: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
  });
});

// GET /api/products/:id
productsRouter.get('/:id', async (req, res) => {
  const id = z.string().regex(/^[a-z0-9-]{1,80}$/, 'Invalid product id').parse(req.params.id);
  const doc = await productsCol.doc(id).get();
  if (!doc.exists) throw notFound('Product not found');
  res.json({ data: toProduct(doc) });
});

// GET /api/categories
categoriesRouter.get('/', async (_req, res) => {
  const snap = await categoriesCol.orderBy('name').get();
  res.json({
    data: snap.docs.map((d) => ({ slug: d.id, name: d.get('name') as string, count: d.get('count') as number })),
  });
});
