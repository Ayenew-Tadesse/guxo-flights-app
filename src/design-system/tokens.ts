/**
 * Shared design tokens for the Guxo app family (Guxo Flights, Guxo, Gexi).
 * Every app uses the same type, radius and breakpoint scale; only the
 * brand colours change. Values are lifted from each app's web prototype
 * so the native apps look the same as the prototypes.
 */

export type BrandColors = {
  /** Behind the app column on wide screens. */
  page: string;
  /** The app column itself. */
  frame: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  primary: string;
  /** Second gradient stop; also used for dots and accents. */
  primary2: string;
  /** Text on primary / gradient surfaces. */
  primaryInk: string;
  line: string;
  lineStrong: string;
  good: string;
  bad: string;
};

export type BrandName = 'guxoFlights' | 'guxo';

export type Brand = {
  name: BrandName;
  displayName: string;
  colors: BrandColors;
};

export const brands: Record<BrandName, Brand> = {
  guxoFlights: {
    name: 'guxoFlights',
    displayName: 'Guxo Flights',
    colors: {
      page: '#EAF2FE',
      frame: '#FFFFFF',
      surface: '#FFFFFF',
      surfaceAlt: '#E9F1FD',
      ink: '#091540',
      inkSoft: '#4C5A85',
      inkFaint: '#8894B8',
      primary: '#1B2CC1',
      primary2: '#7692FF',
      primaryInk: '#FFFFFF',
      line: '#DCE7FA',
      lineStrong: '#ABD2FA',
      good: '#2E8B57',
      bad: '#C24545',
    },
  },
  guxo: {
    name: 'guxo',
    displayName: 'Guxo',
    colors: {
      page: '#EFF4EE',
      frame: '#FFFFFF',
      surface: '#FFFFFF',
      surfaceAlt: '#E8F0E6',
      ink: '#122420',
      inkSoft: '#4E6459',
      inkFaint: '#8AA298',
      primary: '#0E6B5C',
      primary2: '#3FAE8E',
      primaryInk: '#FFFFFF',
      line: '#DCE7DF',
      lineStrong: '#A9CEBE',
      good: '#2E8B57',
      bad: '#C24545',
    },
  },
};

/** Payment brand colours (same in every app). */
export const payColors = {
  telebirr: '#2FAE47',
  visa: '#1A1F71',
  mcRed: '#EB4141',
  mcYellow: '#F2A900',
};

export const radius = {
  seat: 7,
  chip: 12,
  field: 13,
  button: 14,
  card: 16,
  strip: 18,
  panel: 20,
  pill: 999,
};

/** Poppins at each weight the prototypes use. */
export const fonts = {
  400: 'Poppins_400Regular',
  500: 'Poppins_500Medium',
  600: 'Poppins_600SemiBold',
  700: 'Poppins_700Bold',
  800: 'Poppins_800ExtraBold',
} as const;

export type Weight = keyof typeof fonts;

/**
 * Responsive tiers, copied from the prototypes' breakpoints. Wider windows
 * get a wider app column, a bigger root type size (every rem-based size
 * scales with it) and roomier padding.
 */
export const tiers = [
  { min: 0, maxWidth: 760, scale: 1, pad: 18 },
  { min: 600, maxWidth: 760, scale: 1.04, pad: 26 },
  { min: 768, maxWidth: 820, scale: 1.08, pad: 26 },
  { min: 1024, maxWidth: 960, scale: 1.12, pad: 36 },
  { min: 1440, maxWidth: 1080, scale: 1.16, pad: 48 },
  { min: 1920, maxWidth: 1200, scale: 1.2, pad: 48 },
] as const;

/** Card shadow from the prototypes. */
export const shadow = '0px 1px 2px rgba(9,21,64,0.06), 0px 16px 32px rgba(9,21,64,0.13)';
