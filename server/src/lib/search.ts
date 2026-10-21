const MAX_PREFIX = 20;

export function tokenize(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2);
}

/**
 * Firestore has no full-text search. Each product stores every prefix (2..20 chars)
 * of every word in its title, brand and category, so `array-contains` on one
 * lowercase token gives prefix matching ("cush" finds "Cushion").
 */
export function buildKeywords(fields: string[]): string[] {
  const out = new Set<string>();
  for (const token of fields.flatMap(tokenize)) {
    for (let i = 2; i <= Math.min(token.length, MAX_PREFIX); i++) out.add(token.slice(0, i));
  }
  return [...out];
}

/** Longest token goes to Firestore (most selective); the rest are checked on the scanned rows. */
export function splitQuery(search: string): { primary?: string; extra: string[] } {
  const tokens = [...new Set(tokenize(search))].sort((a, b) => b.length - a.length);
  if (tokens.length === 0) return { extra: [] };
  return { primary: tokens[0]!.slice(0, MAX_PREFIX), extra: tokens.slice(1).map((t) => t.slice(0, MAX_PREFIX)) };
}
