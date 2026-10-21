import { categoriesCol, db, productsCol } from '../firebase.js';
import { buildKeywords } from '../lib/search.js';
import { CATEGORIES, PRODUCTS } from './products.js';

const round2 = (n: number) => Math.round(n * 100) / 100;

async function seed() {
  const names = new Map<string, string>(CATEGORIES.map((c) => [c.slug, c.name]));
  const batch = db.batch();

  PRODUCTS.forEach((p, index) => {
    const categoryName = names.get(p.category);
    if (!categoryName) throw new Error(`Unknown category "${p.category}" on ${p.id}`);

    // For sale items the listed price is the sale price; derive the original from the discount.
    const originalPrice = p.discount ? round2(p.price / (1 - p.discount / 100)) : null;
    const images = [1, 2, 3].map((n) => `/products/${p.id}-${n}.svg`);

    batch.set(productsCol.doc(p.id), {
      title: p.title,
      description: p.description,
      brand: p.brand,
      category: p.category,
      categoryName,
      price: p.price,
      originalPrice,
      discountPercentage: p.discount ?? 0,
      rating: p.rating,
      stock: p.stock,
      images,
      thumbnail: images[0],
      specs: p.specs.map(([label, value]) => ({ label, value })),
      searchKeywords: buildKeywords([p.title, p.brand, categoryName]),
      sortIndex: index,
    });
  });

  for (const c of CATEGORIES) {
    batch.set(categoriesCol.doc(c.slug), { name: c.name, count: PRODUCTS.filter((p) => p.category === c.slug).length });
  }

  await batch.commit();
  console.log(`Seeded ${PRODUCTS.length} products in ${CATEGORIES.length} categories.`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
