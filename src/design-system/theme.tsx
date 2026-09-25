import { createContext, useContext, type ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';

import { brands, tiers, type Brand, type BrandName } from './tokens';

const BrandContext = createContext<Brand>(brands.guxoFlights);

/** Wrap an app (or a preview) to choose which brand the kit renders in. */
export function BrandProvider({ brand, children }: { brand: BrandName; children: ReactNode }) {
  return <BrandContext.Provider value={brands[brand]}>{children}</BrandContext.Provider>;
}

/** The active brand: its name and colours. Kit components read this. */
export function useBrand() {
  return useContext(BrandContext);
}

/** Shortcut for the active brand's colours. */
export function useColors() {
  return useContext(BrandContext).colors;
}

/**
 * The responsive tier for the current window: column width, root type
 * scale and side padding, plus `rem()` to turn a prototype rem size into
 * pixels at this tier.
 */
export function useLayout() {
  const { width, height } = useWindowDimensions();
  let tier: (typeof tiers)[number] = tiers[0];
  for (const t of tiers) if (width >= t.min) tier = t;
  const column = Math.min(width, tier.maxWidth);
  return {
    width,
    height,
    column,
    maxWidth: tier.maxWidth,
    scale: tier.scale,
    pad: tier.pad,
    atLeast: (min: number) => width >= min,
    rem: (n: number) => Math.round(n * 16 * tier.scale * 100) / 100,
  };
}
