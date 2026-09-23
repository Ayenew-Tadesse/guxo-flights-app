/**
 * Guxo Flights design tokens, carried over from the web prototype
 * (github.com/Ayenew-Tadesse/Guxo-Flights) so both versions look alike.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  background: '#EAF2FE',
  surface: '#FFFFFF',
  surfaceAlt: '#E9F1FD',
  ink: '#091540',
  inkSoft: '#4C5A85',
  inkFaint: '#8894B8',
  primary: '#1B2CC1',
  primarySoft: '#7692FF',
  onPrimary: '#FFFFFF',
  line: '#DCE7FA',
  lineStrong: '#ABD2FA',
  good: '#2E8B57',
  bad: '#C24545',
  telebirr: '#2FAE47',
  visa: '#1A1F71',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  small: 10,
  medium: 14,
  large: 20,
  pill: 999,
} as const;

export const Fonts = Platform.select({
  web: {
    sans: 'var(--font-display)',
    mono: 'var(--font-mono)',
  },
  default: {
    sans: undefined,
    mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export const MaxContentWidth = 760;
