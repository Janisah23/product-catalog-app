export type Shape =
  | 'mug' | 'vase' | 'bowl' | 'lamp' | 'globe' | 'pendant' | 'throw' | 'cushion'
  | 'stool' | 'table' | 'notebook' | 'pens' | 'tray' | 'tote' | 'pouch';

export interface SeedProduct {
  id: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  /** Set when the product is on sale; price is derived from it. */
  discount?: number;
  rating: number;
  stock: number;
  description: string;
  specs: [string, string][];
  /** Drives the generated placeholder photography only; never stored in Firestore. */
  art: { shape: Shape; main: string; accent: string; bg: string };
}

export const CATEGORIES = [
  { slug: 'ceramics', name: 'Ceramics' },
  { slug: 'lighting', name: 'Lighting' },
  { slug: 'textiles', name: 'Textiles' },
  { slug: 'furniture', name: 'Furniture' },
  { slug: 'stationery', name: 'Stationery' },
  { slug: 'bags', name: 'Bags' },
] as const;

const ink = '#2B2C2A', forest = '#354B3C', clay = '#A8735F', oat = '#D8CDB8', olive = '#6F7A5A';
const cream = '#F1ECE0', slate = '#5B6560', rust = '#B85C4A', sage = '#E8EDE7', sand = '#ECE7DC';
const blush = '#EBDCD3', stone = '#E3E1DA', moss = '#D9E0D5';

// `price` is the current price. For discounted items the seed script computes the original price.
export const PRODUCTS: SeedProduct[] = [
  { id: 'sage-stoneware-mug', title: 'Sage Stoneware Mug', brand: 'Kiln & Field', category: 'ceramics', price: 28, rating: 4.7, stock: 42,
    description: 'A wide, hand-glazed mug with a matte sage finish and a thumb rest on the handle. It holds about 350 ml and sits comfortably in one hand.',
    specs: [['Material', 'Glazed stoneware'], ['Capacity', '350 ml'], ['Care', 'Dishwasher and microwave safe']],
    art: { shape: 'mug', main: olive, accent: cream, bg: sage } },
  { id: 'ribbed-bud-vase', title: 'Ribbed Bud Vase', brand: 'Kiln & Field', category: 'ceramics', price: 36, discount: 20, rating: 4.6, stock: 18,
    description: 'A small vase with vertical ribbing and a narrow neck, sized for a single stem or a handful of dried grasses.',
    specs: [['Material', 'Glazed stoneware'], ['Height', '16 cm'], ['Care', 'Hand wash']],
    art: { shape: 'vase', main: cream, accent: clay, bg: blush } },
  { id: 'low-serving-bowl', title: 'Low Serving Bowl', brand: 'Maru Atelier', category: 'ceramics', price: 54, rating: 4.8, stock: 11,
    description: 'A shallow bowl with a speckled white glaze and a visible foot ring. Use it for salads, fruit or keys by the door.',
    specs: [['Material', 'Speckled stoneware'], ['Diameter', '28 cm'], ['Care', 'Dishwasher safe']],
    art: { shape: 'bowl', main: cream, accent: ink, bg: stone } },
  { id: 'oat-glaze-carafe', title: 'Oat Glaze Carafe', brand: 'Maru Atelier', category: 'ceramics', price: 62, rating: 4.5, stock: 3,
    description: 'A tall carafe with a warm oat glaze and a pinched spout that pours cleanly. Fits one litre of water or a large bunch of branches.',
    specs: [['Material', 'Glazed stoneware'], ['Capacity', '1 L'], ['Care', 'Hand wash']],
    art: { shape: 'vase', main: oat, accent: clay, bg: sand } },

  { id: 'arc-table-lamp', title: 'Arc Table Lamp', brand: 'Linden Works', category: 'lighting', price: 148, discount: 20, rating: 4.8, stock: 9,
    description: 'A table lamp with a tapered linen shade and a solid oak base. It gives a warm, even light that suits a bedside or a reading corner.',
    specs: [['Material', 'Oak, linen'], ['Height', '46 cm'], ['Bulb', 'E27, up to 40 W (not included)']],
    art: { shape: 'lamp', main: cream, accent: forest, bg: sage } },
  { id: 'paper-dome-pendant', title: 'Paper Dome Pendant', brand: 'Linden Works', category: 'lighting', price: 96, rating: 4.4, stock: 14,
    description: 'A rice-paper pendant shaped like a shallow dome. It diffuses light softly and comes with a 1.5 m braided cord.',
    specs: [['Material', 'Rice paper, steel frame'], ['Diameter', '40 cm'], ['Cord', '1.5 m, adjustable']],
    art: { shape: 'pendant', main: cream, accent: ink, bg: stone } },
  { id: 'brass-task-lamp', title: 'Brass Task Lamp', brand: 'Fenn Home', category: 'lighting', price: 120, rating: 4.6, stock: 0,
    description: 'A compact desk lamp in brushed brass with a weighted base and a shade you can angle by hand.',
    specs: [['Material', 'Brushed brass'], ['Height', '38 cm'], ['Bulb', 'E14, up to 25 W (not included)']],
    art: { shape: 'lamp', main: '#B79A5B', accent: ink, bg: sand } },
  { id: 'opal-globe-lamp', title: 'Opal Globe Lamp', brand: 'Fenn Home', category: 'lighting', price: 132, discount: 20, rating: 4.7, stock: 6,
    description: 'A frosted opal glass globe on a slim black stem. The light is soft enough to leave on in a hallway at night.',
    specs: [['Material', 'Opal glass, powder-coated steel'], ['Height', '42 cm'], ['Bulb', 'E27, up to 40 W (not included)']],
    art: { shape: 'globe', main: cream, accent: ink, bg: blush } },

  { id: 'wool-blend-throw', title: 'Wool Blend Throw', brand: 'Noor Textile', category: 'textiles', price: 118, rating: 4.9, stock: 20,
    description: 'A heavy woven throw with fringed ends and a soft brushed finish. Big enough to cover a sofa arm to arm.',
    specs: [['Material', '70% wool, 30% cotton'], ['Size', '130 x 180 cm'], ['Care', 'Dry clean']],
    art: { shape: 'throw', main: oat, accent: forest, bg: sage } },
  { id: 'linen-cushion', title: 'Linen Cushion', brand: 'Noor Textile', category: 'textiles', price: 42, rating: 4.5, stock: 60,
    description: 'A stonewashed linen cushion with a hidden zip and a feather-and-down insert. The fabric softens with each wash.',
    specs: [['Material', '100% linen cover'], ['Size', '50 x 50 cm'], ['Care', 'Machine wash cold, cover only']],
    art: { shape: 'cushion', main: clay, accent: cream, bg: stone } },
  { id: 'striped-cotton-throw', title: 'Striped Cotton Throw', brand: 'Noor Textile', category: 'textiles', price: 76, discount: 20, rating: 4.3, stock: 25,
    description: 'A lighter throw in woven cotton with wide tonal stripes. It works as a bed layer in summer and a sofa blanket in winter.',
    specs: [['Material', '100% cotton'], ['Size', '125 x 170 cm'], ['Care', 'Machine wash cold']],
    art: { shape: 'throw', main: slate, accent: cream, bg: moss } },
  { id: 'boucle-cushion', title: 'Bouclé Cushion', brand: 'Atelier Brume', category: 'textiles', price: 58, rating: 4.6, stock: 4,
    description: 'A round-cornered cushion in looped bouclé yarn with a firm insert, so it keeps its shape against a headboard or chair back.',
    specs: [['Material', 'Polyester bouclé cover'], ['Size', '45 x 45 cm'], ['Care', 'Spot clean']],
    art: { shape: 'cushion', main: cream, accent: oat, bg: blush } },

  { id: 'oak-stool', title: 'Oak Stool', brand: 'Fenn Home', category: 'furniture', price: 164, rating: 4.7, stock: 7,
    description: 'A three-legged stool in solid oak with a gently dished seat. Use it at a counter, as a side table or beside a bath.',
    specs: [['Material', 'Solid oak, oil finish'], ['Height', '45 cm'], ['Seat diameter', '32 cm']],
    art: { shape: 'stool', main: '#B58F66', accent: ink, bg: sage } },
  { id: 'pedestal-side-table', title: 'Pedestal Side Table', brand: 'Fenn Home', category: 'furniture', price: 215, discount: 20, rating: 4.8, stock: 5,
    description: 'A round side table with a single turned pedestal and a heavy base. The top is large enough for a lamp and a book.',
    specs: [['Material', 'Ash, matte lacquer'], ['Height', '52 cm'], ['Top diameter', '45 cm']],
    art: { shape: 'table', main: ink, accent: cream, bg: sand } },
  { id: 'walnut-plant-stand', title: 'Walnut Plant Stand', brand: 'Linden Works', category: 'furniture', price: 88, rating: 4.4, stock: 16,
    description: 'A small stand in solid walnut that lifts a pot off the floor so the leaves get more light. Rubber feet protect floors.',
    specs: [['Material', 'Solid walnut, oil finish'], ['Height', '30 cm'], ['Top diameter', '24 cm']],
    art: { shape: 'table', main: '#6B4A38', accent: olive, bg: stone } },
  { id: 'entryway-bench', title: 'Entryway Bench', brand: 'Linden Works', category: 'furniture', price: 289, rating: 4.6, stock: 3,
    description: 'A slim bench in oak with a woven seat, wide enough for two people to put on shoes. Fits under a window or along a hallway wall.',
    specs: [['Material', 'Oak, paper cord seat'], ['Size', '90 x 32 x 44 cm'], ['Load', 'Up to 120 kg']],
    art: { shape: 'stool', main: '#C2A27A', accent: forest, bg: moss } },

  { id: 'linen-bound-notebook', title: 'Linen Bound Notebook', brand: 'Ode Paper', category: 'stationery', price: 24, rating: 4.7, stock: 120,
    description: 'A lay-flat notebook with a linen cover and 160 pages of 100 gsm ruled paper that takes fountain pen ink without bleeding.',
    specs: [['Pages', '160, ruled'], ['Size', 'A5'], ['Paper', '100 gsm, acid free']],
    art: { shape: 'notebook', main: forest, accent: cream, bg: sage } },
  { id: 'dot-grid-journal', title: 'Dot Grid Journal', brand: 'Ode Paper', category: 'stationery', price: 24, discount: 20, rating: 4.5, stock: 75,
    description: 'A journal with a dotted grid, a ribbon marker and an elastic closure. It lies flat from the first page.',
    specs: [['Pages', '192, dot grid'], ['Size', 'A5'], ['Paper', '90 gsm, acid free']],
    art: { shape: 'notebook', main: rust, accent: cream, bg: blush } },
  { id: 'brass-pen-set', title: 'Brass Pen Set', brand: 'Ode Paper', category: 'stationery', price: 46, rating: 4.8, stock: 30,
    description: 'Three refillable pens with brass barrels that darken slowly with use. They arrive in a cardboard sleeve with spare refills.',
    specs: [['Material', 'Brass'], ['Set', '3 pens, 3 refills'], ['Ink', 'Black, 0.7 mm']],
    art: { shape: 'pens', main: '#B79A5B', accent: ink, bg: stone } },
  { id: 'desk-organiser', title: 'Desk Organiser', brand: 'Fenn Home', category: 'stationery', price: 52, rating: 4.3, stock: 12,
    description: 'A shallow oak tray with three compartments for pens, cards and a phone. The felt base keeps it from sliding on a desk.',
    specs: [['Material', 'Oak, wool felt base'], ['Size', '30 x 14 x 4 cm'], ['Care', 'Wipe clean']],
    art: { shape: 'tray', main: '#B58F66', accent: ink, bg: sand } },

  { id: 'canvas-market-tote', title: 'Canvas Market Tote', brand: 'Atelier Brume', category: 'bags', price: 38, rating: 4.5, stock: 80,
    description: 'A sturdy cotton canvas tote with reinforced handles and an inside pocket. It folds flat and carries about 12 kg.',
    specs: [['Material', '12 oz cotton canvas'], ['Size', '40 x 38 x 12 cm'], ['Care', 'Machine wash cold']],
    art: { shape: 'tote', main: oat, accent: forest, bg: sage } },
  { id: 'leather-zip-pouch', title: 'Leather Zip Pouch', brand: 'Maru Atelier', category: 'bags', price: 64, discount: 20, rating: 4.6, stock: 22,
    description: 'A flat pouch in vegetable-tanned leather with a metal zip. It holds cables, a passport or a few pens.',
    specs: [['Material', 'Vegetable-tanned leather'], ['Size', '22 x 14 cm'], ['Care', 'Wipe with a dry cloth']],
    art: { shape: 'pouch', main: clay, accent: ink, bg: blush } },
  { id: 'waxed-weekender', title: 'Waxed Weekender', brand: 'Atelier Brume', category: 'bags', price: 142, rating: 4.7, stock: 8,
    description: 'A roomy waxed cotton bag with leather handles and a detachable strap. It fits two days of clothes and a pair of shoes.',
    specs: [['Material', 'Waxed cotton, leather trim'], ['Capacity', '32 L'], ['Care', 'Spot clean, re-wax yearly']],
    art: { shape: 'tote', main: olive, accent: clay, bg: moss } },
  { id: 'travel-pouch-set', title: 'Travel Pouch Set', brand: 'Atelier Brume', category: 'bags', price: 34, rating: 4.2, stock: 35,
    description: 'Two nylon pouches, one small and one medium, for toiletries or chargers. Wipe-clean lining and a zip on each.',
    specs: [['Material', 'Recycled nylon'], ['Set', '2 pouches'], ['Care', 'Wipe clean']],
    art: { shape: 'pouch', main: slate, accent: cream, bg: stone } },
];
