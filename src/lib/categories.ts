import { Armchair, Coffee, Lamp, Layers, Package, PenLine, ShoppingBag, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  ceramics: Coffee,
  lighting: Lamp,
  textiles: Layers,
  furniture: Armchair,
  stationery: PenLine,
  bags: ShoppingBag,
};

/** Icon for a category slug. New categories fall back to a generic box. */
export const categoryIcon = (slug: string): LucideIcon => ICONS[slug] ?? Package;

/** Every category has its own page at this address. */
export const categoryPath = (slug: string) => `/catalog/${slug}`;
