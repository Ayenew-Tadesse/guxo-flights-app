/**
 * Shared design tokens for the Guxo app family (Guxo Flights, Guxo, Gexi).
 * Every app uses the same scale for spacing, radius and type; only the
 * brand colours change. Colour values come from each app's web prototype.
 */

export type BrandColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  primary: string;
  primarySoft: string;
  primaryTint: string;
  onPrimary: string;
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
      background: '#EAF2FE',
      surface: '#FFFFFF',
      surfaceAlt: '#E9F1FD',
      ink: '#091540',
      inkSoft: '#4C5A85',
      inkFaint: '#8894B8',
      primary: '#1B2CC1',
      primarySoft: '#7692FF',
      primaryTint: '#EEF1FF',
      onPrimary: '#FFFFFF',
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
      background: '#EFF4EE',
      surface: '#FFFFFF',
      surfaceAlt: '#E8F0E6',
      ink: '#122420',
      inkSoft: '#4E6459',
      inkFaint: '#8AA298',
      primary: '#0E6B5C',
      primarySoft: '#3FAE8E',
      primaryTint: '#E3F2EC',
      onPrimary: '#FFFFFF',
      line: '#DCE7DF',
      lineStrong: '#A9CEBE',
      good: '#2E8B57',
      bad: '#C24545',
    },
  },
};

export const spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const radius = {
  small: 10,
  medium: 14,
  large: 20,
  pill: 999,
} as const;

/** Type scale shared by every app: size, weight and line height per role. */
export const type = {
  display: { fontSize: 30, fontWeight: '800', lineHeight: 34, letterSpacing: -0.3 },
  title: { fontSize: 22, fontWeight: '800', lineHeight: 27 },
  heading: { fontSize: 18, fontWeight: '700', lineHeight: 23 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 21 },
  bodyStrong: { fontSize: 15, fontWeight: '600', lineHeight: 21 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  label: { fontSize: 11, fontWeight: '700', lineHeight: 14, letterSpacing: 0.6, textTransform: 'uppercase' },
} as const;

export type TypeRole = keyof typeof type;

export const maxContentWidth = 760;
