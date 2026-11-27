import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Real product photographs, one list per product id (1 to 3 photos each, first one is the thumbnail).
 *
 * Accepted values:
 *   - a full https:// URL to a photo you have the right to use, or
 *   - a path to a file you saved in public/, for example '/products/photos/sage-stoneware-mug-1.jpg'.
 *
 * Choose clean, front-facing shots on a plain light background that show the actual item described
 * in the comment above each entry. Never reuse one photo for two different products.
 *
 * You can also skip this map: save photos in public/products/photos named <product-id>-1.jpg, -2.jpg, -3.jpg
 * (jpg, jpeg, png, webp or avif) and they are picked up automatically. See public/products/photos/README.md.
 *
 * Products with no photos at all fall back to the generated illustrations in public/products so the shop
 * still works while you fill this in. `npm run seed` lists every product that is still on a fallback,
 * `npm run seed -- --strict` refuses to seed until none are, and `npm run images:check` confirms
 * that every URL and file in this map loads as an image.
 */
export const PRODUCT_PHOTOS: Record<string, string[]> = {
  // Sage Stoneware Mug (Kiln & Field): A wide, hand-glazed mug with a matte sage finish and a thumb rest on the handle
  'sage-stoneware-mug': [],
  // Ribbed Bud Vase (Kiln & Field): A small vase with vertical ribbing and a narrow neck, sized for a single stem or a handful of dried grasses.
  'ribbed-bud-vase': [],
  // Low Serving Bowl (Maru Atelier): A shallow bowl with a speckled white glaze and a visible foot ring
  'low-serving-bowl': [],
  // Oat Glaze Carafe (Maru Atelier): A tall carafe with a warm oat glaze and a pinched spout that pours cleanly
  'oat-glaze-carafe': [],
  // Arc Table Lamp (Linden Works): A table lamp with a tapered linen shade and a solid oak base
  'arc-table-lamp': [],
  // Paper Dome Pendant (Linden Works): A rice-paper pendant shaped like a shallow dome
  'paper-dome-pendant': [],
  // Brass Task Lamp (Fenn Home): A compact desk lamp in brushed brass with a weighted base and a shade you can angle by hand.
  'brass-task-lamp': [],
  // Opal Globe Lamp (Fenn Home): A frosted opal glass globe on a slim black stem
  'opal-globe-lamp': [],
  // Wool Blend Throw (Noor Textile): A heavy woven throw with fringed ends and a soft brushed finish
  'wool-blend-throw': [],
  // Linen Cushion (Noor Textile): A stonewashed linen cushion with a hidden zip and a feather-and-down insert
  'linen-cushion': [],
  // Striped Cotton Throw (Noor Textile): A lighter throw in woven cotton with wide tonal stripes
  'striped-cotton-throw': [],
  // Bouclé Cushion (Atelier Brume): A round-cornered cushion in looped bouclé yarn with a firm insert, so it keeps its shape against a headboard o
  'boucle-cushion': [],
  // Oak Stool (Fenn Home): A three-legged stool in solid oak with a gently dished seat
  'oak-stool': [],
  // Pedestal Side Table (Fenn Home): A round side table with a single turned pedestal and a heavy base
  'pedestal-side-table': [],
  // Walnut Plant Stand (Linden Works): A small stand in solid walnut that lifts a pot off the floor so the leaves get more light
  'walnut-plant-stand': [],
  // Entryway Bench (Linden Works): A slim bench in oak with a woven seat, wide enough for two people to put on shoes
  'entryway-bench': [],
  // Linen Bound Notebook (Ode Paper): A lay-flat notebook with a linen cover and 160 pages of 100 gsm ruled paper that takes fountain pen ink withou
  'linen-bound-notebook': [],
  // Dot Grid Journal (Ode Paper): A journal with a dotted grid, a ribbon marker and an elastic closure
  'dot-grid-journal': [],
  // Brass Pen Set (Ode Paper): Three refillable pens with brass barrels that darken slowly with use
  'brass-pen-set': [],
  // Desk Organiser (Fenn Home): A shallow oak tray with three compartments for pens, cards and a phone
  'desk-organiser': [],
  // Canvas Market Tote (Atelier Brume): A sturdy cotton canvas tote with reinforced handles and an inside pocket
  'canvas-market-tote': [],
  // Leather Zip Pouch (Maru Atelier): A flat pouch in vegetable-tanned leather with a metal zip
  'leather-zip-pouch': [],
  // Waxed Weekender (Atelier Brume): A roomy waxed cotton bag with leather handles and a detachable strap
  'waxed-weekender': [],
  // Travel Pouch Set (Atelier Brume): Two nylon pouches, one small and one medium, for toiletries or chargers
  'travel-pouch-set': [],
};

const PHOTO_DIR = fileURLToPath(new URL('../../../public/products/photos', import.meta.url));

/** Photos for a product: the map above first, otherwise files named <id>-1..3 in public/products/photos. */
export function photosFor(id: string): string[] {
  if (PRODUCT_PHOTOS[id]?.length) return PRODUCT_PHOTOS[id];
  if (!existsSync(PHOTO_DIR)) return [];
  const pattern = new RegExp(`^${id}-[1-3]\\.(jpe?g|png|webp|avif)$`, 'i');
  return readdirSync(PHOTO_DIR)
    .filter((file) => pattern.test(file))
    .sort()
    .map((file) => `/products/photos/${file}`);
}
