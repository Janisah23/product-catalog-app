import { Router } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { cartItemsCol, db, productsCol } from '../firebase.js';
import { conflict, notFound } from '../lib/errors.js';
import { fromCents, toCents } from '../lib/money.js';
import { requireAuth } from '../middleware/auth.js';

export const cartRouter = Router();

/** Most units of one product a single cart line may hold. */
const MAX_LINE_QTY = 10;

// Every cart route sits behind requireAuth. The cart path is derived from the verified uid,
// never from the URL or body, so one user cannot address another user's cart.
cartRouter.use(requireAuth);

const productId = z.string().regex(/^[a-z0-9-]{1,80}$/, 'Invalid product id');
const quantity = z.number().int().min(1).max(MAX_LINE_QTY);
const addBody = z.object({ productId, quantity: quantity.default(1) });
const patchBody = z.object({ quantity });

async function buildCart(uid: string) {
  const itemsSnap = await cartItemsCol(uid).orderBy('createdAt', 'asc').get();
  const refs = itemsSnap.docs.map((d) => productsCol.doc(d.id));
  const products = refs.length ? await db.getAll(...refs) : [];
  const byId = new Map(products.map((p) => [p.id, p]));

  let subtotalCents = 0;
  let itemCount = 0;
  const items = itemsSnap.docs.flatMap((item) => {
    const product = byId.get(item.id);
    if (!product?.exists) return []; // product was removed from the catalog
    const qty = item.get('quantity') as number;
    const price = product.get('price') as number;
    const lineCents = toCents(price) * qty; // price always comes from the database, never the client
    subtotalCents += lineCents;
    itemCount += qty;
    return [
      {
        productId: item.id,
        quantity: qty,
        lineTotal: fromCents(lineCents),
        product: {
          id: product.id,
          title: product.get('title') as string,
          brand: product.get('brand') as string,
          categoryName: product.get('categoryName') as string,
          price,
          originalPrice: (product.get('originalPrice') as number | null) ?? null,
          thumbnail: product.get('thumbnail') as string,
          stock: product.get('stock') as number,
        },
      },
    ];
  });

  return { items, itemCount, subtotal: fromCents(subtotalCents) };
}

function limitFor(stock: number) {
  return Math.min(stock, MAX_LINE_QTY);
}

// GET /api/cart
cartRouter.get('/', async (req, res) => {
  res.json({ data: await buildCart(req.user!.uid) });
});

// POST /api/cart/items  { productId, quantity? }  adds to the existing line if there is one
cartRouter.post('/items', async (req, res) => {
  const { uid } = req.user!;
  const body = addBody.parse(req.body);
  const itemRef = cartItemsCol(uid).doc(body.productId);

  const created = await db.runTransaction(async (tx) => {
    const [product, item] = await Promise.all([tx.get(productsCol.doc(body.productId)), tx.get(itemRef)]);
    if (!product.exists) throw notFound('Product not found');
    const max = limitFor(product.get('stock') as number);
    if (max < 1) throw conflict('OUT_OF_STOCK', 'This product is out of stock');
    const current = item.exists ? (item.get('quantity') as number) : 0;
    const next = current + body.quantity;
    if (next > max) {
      throw conflict('QUANTITY_LIMIT', `You can have at most ${max} of this product in your cart`);
    }
    if (item.exists) tx.update(itemRef, { quantity: next, updatedAt: FieldValue.serverTimestamp() });
    else tx.set(itemRef, { quantity: next, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    return !item.exists;
  });

  res.status(created ? 201 : 200).json({ data: await buildCart(uid) });
});

// PATCH /api/cart/items/:productId  { quantity }  sets the quantity
cartRouter.patch('/items/:productId', async (req, res) => {
  const { uid } = req.user!;
  const id = productId.parse(req.params.productId);
  const { quantity: next } = patchBody.parse(req.body);
  const itemRef = cartItemsCol(uid).doc(id);

  await db.runTransaction(async (tx) => {
    const [product, item] = await Promise.all([tx.get(productsCol.doc(id)), tx.get(itemRef)]);
    if (!item.exists) throw notFound('Item is not in your cart');
    const max = product.exists ? limitFor(product.get('stock') as number) : 0;
    if (next > max) {
      throw conflict('QUANTITY_LIMIT', max < 1 ? 'This product is out of stock' : `You can have at most ${max} of this product in your cart`);
    }
    tx.update(itemRef, { quantity: next, updatedAt: FieldValue.serverTimestamp() });
  });

  res.json({ data: await buildCart(uid) });
});

// DELETE /api/cart/items/:productId
cartRouter.delete('/items/:productId', async (req, res) => {
  const { uid } = req.user!;
  const id = productId.parse(req.params.productId);
  const itemRef = cartItemsCol(uid).doc(id);
  const item = await itemRef.get();
  if (!item.exists) throw notFound('Item is not in your cart');
  await itemRef.delete();
  res.json({ data: await buildCart(uid) });
});
