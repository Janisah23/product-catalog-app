/**
 * Confirms every photo in server/src/seed/photos.ts is reachable and is really an image.
 * Run with: npm run images:check
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { photosFor } from '../server/src/seed/photos.ts';
import { PRODUCTS } from '../server/src/seed/products.ts';

const TIMEOUT_MS = 15_000;
const problems: string[] = [];
let checked = 0;

async function checkRemote(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { Range: 'bytes=0-0' }, signal: AbortSignal.timeout(TIMEOUT_MS), redirect: 'follow' });
    if (!res.ok && res.status !== 206) return `HTTP ${res.status}`;
    const type = res.headers.get('content-type') ?? '';
    return type.startsWith('image/') ? null : `not an image (${type || 'no content-type'})`;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

for (const product of PRODUCTS) {
  const photos = photosFor(product.id);
  if (photos.length === 0) {
    problems.push(`${product.id}: no photos yet`);
    continue;
  }
  if (new Set(photos).size !== photos.length) problems.push(`${product.id}: the same photo is listed twice`);
  for (const src of photos) {
    checked += 1;
    const error = /^https?:\/\//.test(src)
      ? await checkRemote(src)
      : src.startsWith('/') && existsSync(join('public', src))
        ? null
        : 'file not found in public/';
    if (error) problems.push(`${product.id}: ${src} -> ${error}`);
  }
}

// One photo must never stand in for two different products.
const owners = new Map<string, string>();
for (const product of PRODUCTS) {
  for (const src of photosFor(product.id)) {
    const owner = owners.get(src);
    if (owner && owner !== product.id) problems.push(`${src} is used by both ${owner} and ${product.id}`);
    owners.set(src, product.id);
  }
}

console.log(`Checked ${checked} photo(s) for ${PRODUCTS.length} products.`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log('All photos load.');
