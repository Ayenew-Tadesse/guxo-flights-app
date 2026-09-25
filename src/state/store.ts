/**
 * App state, kept in one small store like the web prototype's `state`
 * object. Screens read it with `useApp()` and change it with the actions
 * below. The account (with points, cards and linked apps) and the saved
 * traveler are persisted; trips live for the session, as in the prototype.
 */
import { useSyncExternalStore } from 'react';

import {
  addDaysIso,
  airport,
  cheapestPriceFor,
  generateFlights,
  todayIso,
  uid,
  type CardBrand,
  type FareId,
  type Flight,
} from '@/data/flights';
import { loadJson, saveJson } from './storage';

export type LedgerKind = 'earn' | 'bonus' | 'redeem' | 'refund' | 'reverse';
export type LedgerEntry = { id: string; key: string | null; kind: LedgerKind; text: string; pts: number; at: string };
export type SavedCard = { id: string; brand: CardBrand; last4: string; exp: string; name: string; isDefault: boolean };

export type Account = {
  firstName: string;
  lastName: string;
  name: string;
  dob: string;
  street: string;
  city: string;
  email: string;
  password: string;
  phone?: string;
  points?: LedgerEntry[];
  cards?: SavedCard[];
  linked?: Record<string, { at: string }>;
};

export type Leg = {
  label: string | null;
  origin: string;
  destination: string;
  originCity: string;
  destCity: string;
  dep: Date;
  arr: Date;
  flightNo: string;
  seats: string[];
  gate?: string;
  boardingTime?: Date;
};

export type Trip = {
  id: string;
  tripType: 'one' | 'round';
  legs: Leg[];
  fareTier: FareId;
  fareName: string;
  names: string[];
  price: number;
  pnr: string;
  checkedIn: boolean;
  cancelled: boolean;
  paymentKind: string;
  paymentLabel: string;
  paymentSub: string;
  bookedAt: Date;
  checkedInAt?: Date;
  cancelledAt?: Date;
  pointsEarned: number;
  pointsUsed: number;
};

export type AppState = {
  currentUser: Account | null;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  tripType: 'one' | 'round';
  passengers: number;
  bookingLeg: 'out' | 'return';
  flights: Flight[];
  /** The results page's date strip: the day before, the day, the day after. */
  dateChips: { iso: string; price: number | null }[];
  outFlight: Flight | null;
  returnFlight: Flight | null;
  fareTier: FareId | null;
  seatsOut: string[];
  seatsReturn: string[];
  names: string[];
  paxEmail: string;
  trips: Trip[];
  lastTripId: string | null;
  readNotifs: Record<string, boolean>;
  loading: boolean;
  toast: { id: number; text: string } | null;
  confirm: { title: string; body: string; ok: string; cancel?: string; danger?: boolean; onOk: () => void } | null;
};

const ACCOUNT_KEY = 'hidgo_account';
const TRAVELER_KEY = 'hidgo_traveler';

let state: AppState = {
  currentUser: null,
  origin: 'ADD',
  destination: 'MQX',
  departDate: todayIso(),
  returnDate: '',
  tripType: 'one',
  passengers: 1,
  bookingLeg: 'out',
  flights: [],
  dateChips: [],
  outFlight: null,
  returnFlight: null,
  fareTier: null,
  seatsOut: [],
  seatsReturn: [],
  names: [],
  paxEmail: '',
  trips: [],
  lastTripId: null,
  readNotifs: {},
  loading: false,
  toast: null,
  confirm: null,
};

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const getState = () => state;
export function setState(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
  listeners.forEach((l) => l());
}
export function useApp() {
  return useSyncExternalStore(subscribe, getState, getState);
}

/* --------------------------------------------------------------- account */

export const loadAccount = () => loadJson<Account>(ACCOUNT_KEY);
export function saveAccount(a: Account) {
  saveJson(ACCOUNT_KEY, a);
  setState({ currentUser: { ...a } });
}
export const loadTraveler = () => loadJson<{ name: string; email: string }>(TRAVELER_KEY);
export const saveTraveler = (name: string, email: string) => saveJson(TRAVELER_KEY, { name, email });

/** Apply a change to the signed-in account and persist it. */
export function updateAccount(fn: (a: Account) => void) {
  const cur = state.currentUser;
  if (!cur) return;
  const a: Account = JSON.parse(JSON.stringify(cur));
  fn(a);
  saveAccount(a);
}

/* ------------------------------------------------------------ Guxo Points */
// Earn 1 point per ETB 10 paid; every 10 points = ETB 1 off at checkout.
// Tiers go by lifetime points earned.

export const TIERS = [
  { name: 'Blue', min: 0 },
  { name: 'Silver', min: 1000 },
  { name: 'Gold', min: 3000 },
];
export const PROFILE_BONUS = 250;
export const LINK_BONUS = 500;
export const MIN_REDEEM = 100;

export const SIBLING_APPS = [
  { id: 'guxo', name: 'Guxo', what: 'Bus booking', c1: '#0E6B5C', c2: '#3FAE8E', mark: 'G', url: 'https://ayenew-tadesse.github.io/Guxo/', live: true },
  { id: 'gexi', name: 'Gexi', what: 'Online shopping', c1: '#4C5A85', c2: '#8894B8', mark: 'Gx', url: null, live: false },
];

export const pointsFor = (etb: number) => Math.round(etb / 10);
export const fmtPts = (n: number) => Math.round(n).toLocaleString();
export const ledger = (a: Account | null) => (a && Array.isArray(a.points) ? a.points : []);
export const pointsBalance = (a: Account | null) => ledger(a).reduce((s, e) => s + e.pts, 0);
export function tierInfo(a: Account | null) {
  const life = ledger(a).reduce((s, e) => s + (e.kind === 'earn' || e.kind === 'bonus' || e.kind === 'reverse' ? e.pts : 0), 0);
  let cur = TIERS[0];
  let next: (typeof TIERS)[number] | null = TIERS[1];
  TIERS.forEach((t, i) => {
    if (life >= t.min) {
      cur = t;
      next = TIERS[i + 1] ?? null;
    }
  });
  const nxt = next as (typeof TIERS)[number] | null;
  return {
    life,
    tier: cur.name,
    next: nxt,
    toNext: nxt ? nxt.min - life : 0,
    pct: nxt ? Math.max(0, Math.min(100, Math.round(((life - cur.min) / (nxt.min - cur.min)) * 100))) : 100,
  };
}

/** Adds a ledger entry; a `key` makes one-time bonuses and per-trip entries idempotent. */
export function addPoints(pts: number, text: string, kind: LedgerKind, key?: string) {
  const a = state.currentUser;
  if (!a || !pts) return 0;
  if (key && ledger(a).some((e) => e.key === key)) return 0;
  updateAccount((acc) => {
    acc.points = [{ id: uid(), key: key ?? null, kind, text, pts, at: new Date().toISOString() }, ...ledger(acc)];
  });
  return pts;
}

export const PROFILE_FIELDS: [keyof Account, string][] = [
  ['firstName', 'first name'],
  ['lastName', 'last name'],
  ['email', 'email'],
  ['phone', 'phone number'],
  ['dob', 'date of birth'],
  ['street', 'street address'],
  ['city', 'city'],
];
export function profileCompletion(a: Partial<Account> | null) {
  const missing = PROFILE_FIELDS.filter(([k]) => !(a && a[k] && String(a[k]).trim())).map(([, l]) => l);
  return { pct: Math.round(((PROFILE_FIELDS.length - missing.length) / PROFILE_FIELDS.length) * 100), missing };
}

export const savedCards = (a: Account | null) => (a && Array.isArray(a.cards) ? a.cards : []);
export function addSavedCard(o: { brand: CardBrand; last4: string; exp: string; name: string; makeDefault?: boolean }) {
  let saved: SavedCard | null = null;
  updateAccount((a) => {
    const cards = savedCards(a).slice();
    let card = cards.find((c) => c.brand === o.brand && c.last4 === o.last4 && c.exp === o.exp);
    if (!card) {
      card = { id: 'CD-' + uid(), brand: o.brand, last4: o.last4, exp: o.exp, name: o.name, isDefault: false };
      cards.push(card);
    }
    if (o.makeDefault || cards.length === 1) cards.forEach((c) => (c.isDefault = c === card));
    a.cards = cards;
    saved = card;
  });
  return saved as SavedCard | null;
}
export function setDefaultCard(id: string) {
  updateAccount((a) => savedCards(a).forEach((c) => (c.isDefault = c.id === id)));
}
export function removeCard(id: string) {
  updateAccount((a) => {
    const wasDefault = savedCards(a).some((c) => c.id === id && c.isDefault);
    a.cards = savedCards(a).filter((c) => c.id !== id);
    if (wasDefault && a.cards.length) a.cards[0].isDefault = true;
  });
}

/* ------------------------------------------------------------- search */

export function currentLegParams(s: AppState = state) {
  return s.bookingLeg === 'out'
    ? { o: s.origin, d: s.destination, date: s.departDate }
    : { o: s.destination, d: s.origin, date: s.returnDate };
}

export function loadLegResults() {
  const p = currentLegParams();
  const flights = generateFlights(p.o, p.d, p.date);
  const min = state.bookingLeg === 'out' ? todayIso() : state.departDate || todayIso();
  const dateChips = [-1, 0, 1].map((off) => {
    const iso = addDaysIso(p.date, off);
    if (iso < min) return { iso, price: null };
    return { iso, price: off === 0 ? Math.min(...flights.map((f) => f.price)) : cheapestPriceFor(p.o, p.d, iso) };
  });
  setState({ flights, dateChips });
}

export function startSearch(o: string, d: string, date: string, pax: number, tripType: 'one' | 'round', returnDate: string | null) {
  setState({
    origin: o,
    destination: d,
    departDate: date,
    passengers: pax,
    tripType,
    returnDate: returnDate ?? '',
    bookingLeg: 'out',
    outFlight: null,
    returnFlight: null,
    seatsOut: [],
    seatsReturn: [],
    fareTier: null,
  });
  loadLegResults();
}

export const tripRouteText = (t: Trip) => {
  const out = t.legs[0];
  return t.tripType === 'round' && t.legs[1] ? out.origin + ' ⇄ ' + out.destination : out.origin + ' → ' + out.destination;
};

export function legFromFlight(f: Flight, o: string, d: string, label: string | null, seats: string[]): Leg {
  return {
    label,
    origin: o,
    destination: d,
    originCity: airport(o).city,
    destCity: airport(d).city,
    dep: f.dep,
    arr: f.arr,
    flightNo: f.flightNo,
    seats: seats.slice(),
  };
}

export function updateTrip(id: string, patch: Partial<Trip>) {
  setState((s) => ({ trips: s.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
}

/* --------------------------------------------------------------- ui */

let toastTimer: ReturnType<typeof setTimeout> | null = null;
export function showToast(text: string) {
  if (toastTimer) clearTimeout(toastTimer);
  setState({ toast: { id: Date.now(), text } });
  toastTimer = setTimeout(() => setState({ toast: null }), 2600);
}
export const openConfirm = (c: NonNullable<AppState['confirm']>) => setState({ confirm: c });
export const closeConfirm = () => setState({ confirm: null });
