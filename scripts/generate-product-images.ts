/**
 * Generates the placeholder product photography in public/products/.
 * Run with: npm run images
 * Replace the URLs in server/src/seed/products.ts with real photography whenever you have it.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { PRODUCTS, type Shape } from '../server/src/seed/products.ts';

const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i]! - v) * t).toString(16).padStart(2, '0')).join('');
};

// Every shape is drawn with its base centred on (0,0), growing upward.
const draw: Record<Shape, (m: string, a: string) => string> = {
  mug: (m) => `<path d="M126 -190 C236 -200 236 -70 120 -62" fill="none" stroke="${m}" stroke-width="28" stroke-linecap="round"/>
    <rect x="-130" y="-250" width="260" height="250" rx="22" fill="${m}"/><ellipse cx="0" cy="-250" rx="130" ry="20" fill="${mix(m, '#000000', 0.25)}"/>
    <rect x="-100" y="-210" width="26" height="170" rx="13" fill="#fff" opacity=".12"/>`,
  vase: (m, a) => `<path d="M0 -330 C40 -440 60 -520 110 -600" stroke="${a}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M-90 -480 C-40 -470 -10 -430 0 -380 M60 -540 C 20 -520 0 -480 0 -430" stroke="${a}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M-42 -340 L-42 -272 C-175 -232 -175 -30 -92 0 L92 0 C175 -30 175 -232 42 -272 L42 -340 Z" fill="${m}"/>
    <ellipse cx="0" cy="-340" rx="42" ry="9" fill="${mix(m, '#000000', 0.3)}"/>
    ${[-90, -45, 0, 45, 90].map((x) => `<path d="M${x} -250 L${x} -20" stroke="${a}" stroke-width="3" opacity=".25"/>`).join('')}`,
  bowl: (m, a) => `<path d="M-200 -150 L200 -150 C190 -40 100 0 0 0 C-100 0 -190 -40 -200 -150 Z" fill="${m}"/>
    <ellipse cx="0" cy="-150" rx="200" ry="30" fill="${mix(m, '#000000', 0.12)}"/><ellipse cx="0" cy="-146" rx="170" ry="20" fill="${mix(m, '#000000', 0.22)}"/>
    ${Array.from({ length: 18 }, (_, i) => `<circle cx="${-150 + ((i * 53) % 300)}" cy="${-110 + ((i * 37) % 80)}" r="2" fill="${a}" opacity=".5"/>`).join('')}`,
  lamp: (m, a) => `<rect x="-8" y="-330" width="16" height="320" fill="${a}"/><ellipse cx="0" cy="-8" rx="95" ry="14" fill="${a}"/>
    <path d="M-90 -560 L90 -560 L145 -330 L-145 -330 Z" fill="${m}"/><ellipse cx="0" cy="-330" rx="145" ry="14" fill="${mix(m, '#000000', 0.18)}"/>
    <path d="M-60 -540 L-95 -345" stroke="#fff" stroke-width="10" opacity=".25"/>`,
  globe: (m, a) => `<rect x="-6" y="-300" width="12" height="290" fill="${a}"/><ellipse cx="0" cy="-8" rx="85" ry="12" fill="${a}"/>
    <circle cx="0" cy="-420" r="125" fill="${m}"/><circle cx="-40" cy="-465" r="34" fill="#fff" opacity=".35"/><rect x="-28" y="-310" width="56" height="26" fill="${a}"/>`,
  pendant: (m, a) => `<path d="M0 -1000 L0 -470" stroke="${a}" stroke-width="4"/><path d="M-185 -330 A185 185 0 0 1 185 -330 Z" fill="${m}" transform="translate(0 -40)"/>
    <ellipse cx="0" cy="-370" rx="185" ry="12" fill="${mix(m, '#000000', 0.15)}"/><circle cx="0" cy="-350" r="26" fill="#fff" opacity=".85"/>`,
  throw: (m, a) => [0, 1, 2].map((i) => `<g transform="translate(${i % 2 ? 8 : 0} ${-i * 96})"><rect x="-230" y="-92" width="460" height="92" rx="6" fill="${i === 1 ? mix(m, a, 0.35) : m}"/>
    ${[-150, -60, 30, 120].map((x) => `<rect x="${x}" y="-92" width="22" height="92" fill="${a}" opacity=".55"/>`).join('')}
    ${Array.from({ length: 22 }, (_, k) => `<path d="M${-230 + k * 21} 0 l0 14" stroke="${m}" stroke-width="3"/>`).join('')}</g>`).join(''),
  cushion: (m, a) => `<path d="M-170 -20 C-205 -140 -205 -260 -170 -345 C-80 -378 80 -378 170 -345 C205 -260 205 -140 170 -20 C80 12 -80 12 -170 -20 Z" fill="${m}"/>
    <path d="M-150 -300 C-60 -330 60 -330 150 -300" stroke="${a}" stroke-width="3" fill="none" stroke-dasharray="8 8" opacity=".6"/>
    <path d="M-120 -80 L-40 -280 M-20 -50 L80 -300" stroke="#000" stroke-width="3" opacity=".06"/>`,
  stool: (m, a) => `<path d="M-95 -305 L-148 0" stroke="${m}" stroke-width="26" stroke-linecap="round"/><path d="M95 -305 L148 0" stroke="${m}" stroke-width="26" stroke-linecap="round"/>
    <path d="M0 -300 L8 -6" stroke="${mix(m, '#000000', 0.15)}" stroke-width="24" stroke-linecap="round"/>
    <rect x="-160" y="-340" width="320" height="34" rx="4" fill="${mix(m, '#000000', 0.12)}"/><ellipse cx="0" cy="-340" rx="160" ry="26" fill="${m}"/>
    <ellipse cx="0" cy="-342" rx="120" ry="14" fill="${a}" opacity=".08"/>`,
  table: (m, a) => `<ellipse cx="0" cy="-18" rx="95" ry="14" fill="${m}"/><rect x="-20" y="-380" width="40" height="365" fill="${mix(m, '#000000', 0.1)}"/>
    <rect x="-165" y="-410" width="330" height="30" rx="4" fill="${mix(m, '#000000', 0.15)}"/><ellipse cx="0" cy="-410" rx="165" ry="26" fill="${m}"/>
    <ellipse cx="0" cy="-412" rx="120" ry="12" fill="${a}" opacity=".1"/>`,
  notebook: (m, a) => `<rect x="-155" y="-430" width="310" height="430" rx="8" fill="${m}"/><rect x="-155" y="-430" width="30" height="430" rx="6" fill="#000" opacity=".15"/>
    <rect x="98" y="-430" width="12" height="430" fill="${a}" opacity=".6"/><rect x="-60" y="-340" width="120" height="70" fill="${a}" opacity=".85"/>
    <path d="M-45 -315 H45 M-45 -295 H15" stroke="${m}" stroke-width="4"/>`,
  pens: (m, a) => `${[[-84, 430], [-8, 500], [68, 380]].map(([x, h]) => `<rect x="${x! - 14}" y="${-h! - 40}" width="28" height="${h}" rx="14" fill="${m}"/><rect x="${x! - 8}" y="${-h! - 70}" width="16" height="40" fill="${a}"/>`).join('')}
    <rect x="-115" y="-200" width="230" height="200" rx="12" fill="${a}"/><rect x="-115" y="-200" width="230" height="16" fill="#fff" opacity=".1"/>`,
  tray: (m, a) => `<rect x="-235" y="-120" width="470" height="120" rx="8" fill="${m}"/><rect x="-215" y="-100" width="430" height="80" rx="4" fill="${mix(m, '#000000', 0.2)}"/>
    <rect x="-80" y="-100" width="10" height="80" fill="${m}"/><rect x="70" y="-100" width="10" height="80" fill="${m}"/>
    <rect x="-190" y="-95" width="14" height="70" rx="7" fill="${a}" opacity=".85" transform="rotate(8 -183 -60)"/>`,
  tote: (m, a) => `<path d="M-95 -330 C-95 -540 95 -540 95 -330" fill="none" stroke="${m}" stroke-width="24" stroke-linecap="round"/>
    <path d="M-175 -335 L175 -335 L195 0 L-195 0 Z" fill="${m}"/><rect x="-85" y="-215" width="170" height="120" fill="${a}" opacity=".3"/>
    <path d="M-175 -335 L175 -335" stroke="#000" stroke-width="6" opacity=".12"/>`,
  pouch: (m, a) => `<rect x="-195" y="-270" width="390" height="270" rx="30" fill="${m}"/><path d="M-170 -235 H170" stroke="${a}" stroke-width="5" stroke-dasharray="3 7" stroke-linecap="round"/>
    <rect x="140" y="-252" width="30" height="34" rx="4" fill="${a}"/><path d="M-195 -150 H195" stroke="#000" stroke-width="3" opacity=".06"/>`,
};

function frame(variant: 1 | 2 | 3, shape: Shape, main: string, accent: string, bg: string) {
  const wall = variant === 1 ? bg : variant === 2 ? mix(bg, '#ffffff', 0.45) : mix(bg, '#000000', 0.04);
  const floor = `<rect y="780" width="800" height="220" fill="#000" opacity=".05"/>`;
  const arch = `<path d="M170 780 L170 400 A230 230 0 0 1 630 400 L630 780 Z" fill="#fff" opacity=".4"/>`;
  const object = draw[shape](main, accent);
  const body =
    variant === 1
      ? `${floor}<ellipse cx="400" cy="794" rx="230" ry="16" fill="#000" opacity=".12"/><g transform="translate(400 790) scale(1.2)">${object}</g>`
      : variant === 2
        ? `${arch}${floor}<ellipse cx="470" cy="794" rx="190" ry="12" fill="#000" opacity=".12"/><g transform="translate(470 790) scale(1)">${object}</g>`
        : `<g transform="translate(400 1020) scale(1.65)">${object}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000"><rect width="800" height="1000" fill="${wall}"/>${body}</svg>\n`;
}

mkdirSync('public/products', { recursive: true });
for (const p of PRODUCTS) {
  for (const v of [1, 2, 3] as const) {
    writeFileSync(`public/products/${p.id}-${v}.svg`, frame(v, p.art.shape, p.art.main, p.art.accent, p.art.bg));
  }
}
console.log(`Wrote ${PRODUCTS.length * 3} images to public/products/`);
