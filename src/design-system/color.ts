/** Colour helpers standing in for the prototypes' CSS color-mix(). */

function parse(hex: string) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

/** `pct` of colour `a` mixed into `b` (like color-mix(in srgb, a pct%, b)). */
export function mix(a: string, pct: number, b: string) {
  const ca = parse(a);
  const cb = parse(b);
  const t = pct / 100;
  return (
    '#' +
    ca
      .map((v, i) => Math.round(v * t + cb[i] * (1 - t)))
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

/** A hex colour at the given opacity. */
export function alpha(hex: string, a: number) {
  const [r, g, b] = parse(hex);
  return `rgba(${r},${g},${b},${a})`;
}
