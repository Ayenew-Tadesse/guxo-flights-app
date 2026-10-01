/**
 * Flight search through the API client. For now the "server" is a mock
 * route built on the sample flight generator; switching to a real backend
 * only means setting EXPO_PUBLIC_API_URL (and matching this response shape).
 */
import { addDaysIso, cheapestPriceFor, generateFlights, type Flight } from '@/data/flights';
import { ApiError, mockRoute, request } from './client';

export type FlightSearch = {
  origin: string;
  destination: string;
  /** The day to fly (YYYY-MM-DD). */
  date: string;
  /** The earliest bookable day: today, or the outbound date for a return. */
  minDate: string;
};
export type DateChip = { iso: string; price: number | null };
export type SearchResult = { flights: Flight[]; dateChips: DateChip[] };

// On the wire: times are ISO strings.
type FlightJson = Omit<Flight, 'dep' | 'arr'> & { dep: string; arr: string };
type SearchJson = { flights: FlightJson[]; dateChips: DateChip[] };

mockRoute('GET', '/flights/search', (q): SearchJson => {
  const flights = generateFlights(q.origin, q.destination, q.date);
  // The results page's date strip: the day before, the day, the day after.
  const dateChips = [-1, 0, 1].map((off) => {
    const iso = addDaysIso(q.date, off);
    if (iso < q.minDate) return { iso, price: null };
    return { iso, price: off === 0 ? Math.min(...flights.map((f) => f.price)) : cheapestPriceFor(q.origin, q.destination, iso) };
  });
  return { flights: flights.map((f) => ({ ...f, dep: f.dep.toISOString(), arr: f.arr.toISOString() })), dateChips };
});

const isDate = (d: Date) => !Number.isNaN(d.getTime());

/** Flights for one leg, plus the cheapest fare the day before and after. */
export async function searchFlights(search: FlightSearch, opts: { signal?: AbortSignal } = {}): Promise<SearchResult> {
  const json = await request<SearchJson>('/flights/search', {
    query: { origin: search.origin, destination: search.destination, date: search.date, minDate: search.minDate },
    signal: opts.signal,
  });
  if (!json || !Array.isArray(json.flights) || !Array.isArray(json.dateChips)) throw new ApiError('parse', 'search: unexpected shape');
  const flights = json.flights.map((f) => ({ ...f, dep: new Date(f.dep), arr: new Date(f.arr) }));
  if (!flights.every((f) => isDate(f.dep) && isDate(f.arr))) throw new ApiError('parse', 'search: bad times');
  return { flights, dateChips: json.dateChips };
}
