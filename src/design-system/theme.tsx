import { createContext, useContext, type ReactNode } from 'react';

import { brands, type Brand, type BrandName } from './tokens';

const BrandContext = createContext<Brand>(brands.guxoFlights);

/** Wrap an app (or a preview) to choose which brand the kit renders in. */
export function BrandProvider({ brand, children }: { brand: BrandName; children: ReactNode }) {
  return <BrandContext.Provider value={brands[brand]}>{children}</BrandContext.Provider>;
}

/** The active brand: its name and colours. Kit components read this. */
export function useBrand() {
  return useContext(BrandContext);
}
