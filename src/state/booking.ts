/**
 * The booking: the search, the flights you picked, fare, seats, travellers
 * and contact email, plus the step you're on. It's a Zustand store saved as
 * you go (`guxo_booking`), so closing the app mid-booking and coming back
 * offers "Continue your booking" at the same step. Booking clears it; so
 * does "Start over". Search details are kept so the form remembers them.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { friendlyMessage } from '@/api/client';
import { searchFlights } from '@/api/flights';
import { addDaysIso, airport, formatAirport, todayIso, withSeatMap, type FareId, type Flight } from '@/data/flights';
import { persistStorage } from './storage';
import { loadTraveler } from './store';

export const BOOKING_KEY = 'guxo_booking';

export type BookingStep = 'results' | 'fare' | 'payment';
export type TripType = 'one' | 'round';

/** A search: what the booking below was searched with, and each recent search. */
export type Search = { origin: string; destination: string; departDate: string; returnDate: string; tripType: TripType; passengers: number };
/** The search form as you're filling it in (From / To are what's typed). */
export type SearchFormState = { from: string; to: string; departDate: string; returnDate: string; tripType: TripType; passengers: number };

export const MAX_RECENT = 3;
export const MAX_PASSENGERS = 6;

export type BookingState = {
  form: SearchFormState;
  recent: Search[];
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  tripType: TripType;
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
  /** Where an unfinished booking stands; null when there's nothing to continue. */
  step: BookingStep | null;
  updatedAt: string | null;
  /** The current leg's results: loading from the API, ready, or failed (not saved). */
  loadStatus: 'idle' | 'loading' | 'ready' | 'error';
  /** What to tell the traveller when loading failed. */
  loadError: string | null;
};

const selection = {
  bookingLeg: 'out' as const,
  flights: [] as Flight[],
  dateChips: [] as BookingState['dateChips'],
  outFlight: null,
  returnFlight: null,
  fareTier: null,
  seatsOut: [] as string[],
  seatsReturn: [] as string[],
  names: [] as string[],
  paxEmail: '',
  step: null,
  updatedAt: null,
  loadStatus: 'idle' as BookingState['loadStatus'],
  loadError: null as string | null,
};

/** Dates in the past move to today; a return keeps its length of stay. */
function freshDates<T extends { departDate: string; returnDate: string; tripType: TripType }>(q: T): T {
  const today = todayIso();
  if (q.departDate >= today) return q;
  const stay = q.returnDate ? Math.max(0, Math.round((Date.parse(q.returnDate) - Date.parse(q.departDate)) / 86400000)) : 7;
  return { ...q, departDate: today, returnDate: q.tripType === 'round' ? addDaysIso(today, stay) : '' };
}

const initial: BookingState = {
  form: { from: formatAirport(airport('ADD')), to: formatAirport(airport('MQX')), departDate: todayIso(), returnDate: '', tripType: 'one', passengers: 1 },
  recent: [],
  origin: 'ADD',
  destination: 'MQX',
  departDate: todayIso(),
  returnDate: '',
  tripType: 'one',
  passengers: 1,
  ...selection,
};

// Flights are saved as JSON: turn their times back into dates.
const reviveDates = (key: string, value: unknown) => ((key === 'dep' || key === 'arr') && typeof value === 'string' ? new Date(value) : value);

export const useBooking = create<BookingState>()(
  persist(() => initial, {
    name: BOOKING_KEY,
    version: 1,
    storage: createJSONStorage(() => persistStorage, { reviver: reviveDates }),
    // Read once storage is ready (see the root layout).
    skipHydration: true,
    // Loading state is for this session only.
    partialize: ({ loadStatus: _status, loadError: _error, ...rest }) => rest,
    merge: (saved, current) => {
      let s = { ...current, ...(saved as Partial<BookingState>) };
      s = { ...s, form: freshDates({ ...current.form, ...s.form }), recent: Array.isArray(s.recent) ? s.recent.slice(0, MAX_RECENT) : [] };
      // A draft for a day that's passed starts fresh from today.
      if (!s.departDate || s.departDate < todayIso()) return { ...s, ...selection, departDate: todayIso(), returnDate: '' };
      return s;
    },
  }),
);

export const getBooking = useBooking.getState;
function set(patch: Partial<BookingState> | ((s: BookingState) => Partial<BookingState>)) {
  useBooking.setState((s) => ({ ...(typeof patch === 'function' ? patch(s) : patch), updatedAt: new Date().toISOString() }));
}

/* ----------------------------------------------------------- search */

export function currentLegParams(s: BookingState = getBooking()) {
  return s.bookingLeg === 'out'
    ? { o: s.origin, d: s.destination, date: s.departDate }
    : { o: s.destination, d: s.origin, date: s.returnDate };
}

// Each load gets a number, so an older answer arriving late is ignored.
let loadSeq = 0;

/** Load the current leg's flights through the API (shows loading, then results or a friendly error). */
export async function loadLegResults() {
  const s = getBooking();
  const p = currentLegParams(s);
  const seq = ++loadSeq;
  set({ loadStatus: 'loading', loadError: null });
  try {
    const minDate = s.bookingLeg === 'out' ? todayIso() : s.departDate || todayIso();
    const { flights, dateChips } = await searchFlights({ origin: p.o, destination: p.d, date: p.date, minDate });
    if (seq === loadSeq) set({ flights, dateChips, loadStatus: 'ready' });
  } catch (e) {
    if (seq === loadSeq) set({ loadStatus: 'error', loadError: friendlyMessage(e) });
  }
}

/** "Try again" after a failed load. */
export const retryResults = () => loadLegResults();

/** Start a new booking from a search (earlier picks are cleared); the form shows it too. */
export function startSearch(o: string, d: string, date: string, pax: number, tripType: TripType, returnDate: string | null) {
  const ret = tripType === 'round' ? (returnDate ?? '') : '';
  set({
    ...selection,
    origin: o,
    destination: d,
    departDate: date,
    passengers: pax,
    tripType,
    returnDate: ret,
    step: 'results',
    form: { from: formatAirport(airport(o)), to: formatAirport(airport(d)), departDate: date, returnDate: ret, tripType, passengers: pax },
  });
  void loadLegResults();
}

/* ------------------------------------------------------ search form */

/** Change the form; dates and trip type keep each other valid. */
export function setForm(patch: Partial<SearchFormState>) {
  set((s) => {
    const f = { ...s.form, ...patch };
    f.passengers = Math.min(MAX_PASSENGERS, Math.max(1, f.passengers));
    if (f.tripType === 'one') f.returnDate = '';
    else if (!f.returnDate || f.returnDate < f.departDate) f.returnDate = patch.tripType ? addDaysIso(f.departDate, 7) : f.departDate;
    return { form: f };
  });
}

export const swapForm = () => setForm({ from: getBooking().form.to, to: getBooking().form.from });

/** Search, and remember it first in the recent searches (without repeats). */
export function runSearch(q: Search) {
  const same = (r: Search) => r.origin === q.origin && r.destination === q.destination && r.tripType === q.tripType;
  set((s) => ({ recent: [q, ...s.recent.filter((r) => !same(r))].slice(0, MAX_RECENT) }));
  startSearch(q.origin, q.destination, q.departDate, q.passengers, q.tripType, q.tripType === 'round' ? q.returnDate : null);
}

/** Run a recent search again (from today if its dates have passed). */
export const rerun = (q: Search) => runSearch(freshDates(q));

export const clearRecent = () => set({ recent: [] });

/** Results' date strip: search the day before or after. */
export function pickDate(iso: string) {
  const s = getBooking();
  if (s.bookingLeg === 'out') set({ departDate: iso, returnDate: s.returnDate && s.returnDate < iso ? iso : s.returnDate });
  else set({ returnDate: iso });
  void loadLegResults();
}

/* -------------------------------------------------------- selection */

/**
 * Pick a flight for the leg being booked. Round trips go on to the return
 * leg ('return'); otherwise fare, seats and travellers start fresh ('fare').
 */
export function chooseFlight(f: Flight): 'return' | 'fare' {
  const s = getBooking();
  const flight = withSeatMap(f);
  if (s.bookingLeg === 'out' && s.tripType === 'round') {
    set({ outFlight: flight, bookingLeg: 'return' });
    void loadLegResults();
    return 'return';
  }
  const saved = loadTraveler();
  set({
    ...(s.bookingLeg === 'out' ? { outFlight: flight } : { returnFlight: flight }),
    fareTier: null,
    seatsOut: [],
    seatsReturn: [],
    names: Array.from({ length: s.passengers }, (_, i) => (i === 0 && saved?.name ? saved.name : '')),
    paxEmail: saved?.email ?? '',
    step: 'fare',
  });
  return 'fare';
}

export const setFare = (fareTier: FareId) => set({ fareTier });

export function toggleSeat(leg: 'out' | 'return', id: string) {
  const s = getBooking();
  const key = leg === 'out' ? 'seatsOut' : 'seatsReturn';
  const arr = s[key];
  if (arr.includes(id)) set({ [key]: arr.filter((x) => x !== id) });
  else if (arr.length < s.passengers) set({ [key]: [...arr, id] });
}

export function setName(i: number, v: string) {
  set((s) => {
    const names = Array.from({ length: s.passengers }, (_, k) => s.names[k] ?? '');
    names[i] = v;
    return { names };
  });
}

export const setEmail = (paxEmail: string) => set({ paxEmail });

/** The screen you're on, so "Continue your booking" can bring you back to it. */
export function setStep(step: BookingStep) {
  if (getBooking().step !== step) set({ step });
}

/** Forget the unfinished booking; the search itself is kept for the form. */
export const clearDraft = () => useBooking.setState({ ...selection });

/** Is there a booking to continue? */
export function hasDraft(s: BookingState = getBooking()) {
  if (!s.step || !s.flights.length) return false;
  if (s.step === 'results') return true;
  return !!s.outFlight && (s.tripType === 'one' || !!s.returnFlight);
}

/* ------------------------------------------------------- validation */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type BookingErrors = {
  fare: string | null;
  names: (string | null)[];
  email: string | null;
  seatsOut: string | null;
  seatsReturn: string | null;
};

/** What's missing before payment, per field (null = fine). */
export function bookingErrors(s: BookingState = getBooking()): BookingErrors {
  const pax = s.passengers;
  const seats = (n: number) => (n === pax ? null : 'Pick ' + (pax - n) + ' more seat' + (pax - n > 1 ? 's' : '') + ' — one for each traveller.');
  return {
    fare: s.fareTier ? null : 'Choose a fare.',
    names: Array.from({ length: pax }, (_, i) => {
      const n = (s.names[i] ?? '').trim();
      if (!n) return 'Enter this traveller’s full name.';
      if (!/\p{L}.*\s+.*\p{L}/u.test(n)) return 'Enter a first and last name, as on the passport or ID.';
      return null;
    }),
    email: !s.paxEmail.trim() ? 'Enter an email for the booking confirmation.' : EMAIL.test(s.paxEmail.trim()) ? null : 'Enter a valid email, like name@example.com.',
    seatsOut: seats(s.seatsOut.length),
    seatsReturn: s.tripType === 'round' ? seats(s.seatsReturn.length) : null,
  };
}

export function bookingValid(s: BookingState = getBooking()) {
  const e = bookingErrors(s);
  return !e.fare && !e.email && !e.seatsOut && !e.seatsReturn && e.names.every((x) => !x);
}
