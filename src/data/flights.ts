/**
 * Mock data for the first build of the app. The booking flow reads from here
 * until the live API work (Q1 roadmap: state management + live API) lands.
 */

export type Airport = { code: string; city: string };

export const AIRPORTS: Airport[] = [
  { code: 'ADD', city: 'Addis Ababa' },
  { code: 'BJR', city: 'Bahir Dar' },
  { code: 'GDQ', city: 'Gondar' },
  { code: 'LLI', city: 'Lalibela' },
  { code: 'MQX', city: 'Mekelle' },
  { code: 'DIR', city: 'Dire Dawa' },
  { code: 'JIM', city: 'Jimma' },
  { code: 'AMH', city: 'Arba Minch' },
];

export type Flight = {
  id: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
  duration: string;
  price: number; // ETB, Standard fare
};

const SLOTS = [
  { depart: '06:30', arrive: '07:35', duration: '1h 05m', price: 3450 },
  { depart: '10:15', arrive: '11:25', duration: '1h 10m', price: 3890 },
  { depart: '15:40', arrive: '16:50', duration: '1h 10m', price: 3620 },
  { depart: '19:05', arrive: '20:10', duration: '1h 05m', price: 4120 },
];

export function flightsFor(from: string, to: string): Flight[] {
  return SLOTS.map((s, i) => ({ id: `${from}-${to}-${i}`, from, to, ...s }));
}

export function findFlight(id: string): Flight | undefined {
  const [from, to] = id.split('-');
  return flightsFor(from, to).find((f) => f.id === id);
}

export function cityOf(code: string) {
  return AIRPORTS.find((a) => a.code === code)?.city ?? code;
}

export const FARES = [
  { id: 'basic', name: 'Basic', note: 'Carry-on only · no changes', extra: 0 },
  { id: 'standard', name: 'Standard', note: '23kg bag · change for a fee', extra: 650 },
  { id: 'flex', name: 'Flex', note: '2 bags · free changes & refunds', extra: 1400 },
] as const;

export type FareId = (typeof FARES)[number]['id'];

export const PAYMENT_METHODS = [
  { id: 'telebirr', name: 'Telebirr' },
  { id: 'cbe', name: 'CBE Birr' },
  { id: 'card', name: 'Visa / Mastercard' },
] as const;

export const SAMPLE_TRIPS = [
  { pnr: 'GXF4K2', from: 'ADD', to: 'BJR', date: 'Oct 12, 2026', time: '06:30', status: 'Upcoming' },
  { pnr: 'GXF9Q7', from: 'LLI', to: 'ADD', date: 'Oct 15, 2026', time: '15:40', status: 'Upcoming' },
];

export const SAMPLE_NOTIFICATIONS = [
  { id: 'n1', title: 'Check-in opens soon', body: 'Online check-in for ADD → BJR opens 24h before departure.', ago: '2h ago' },
  { id: 'n2', title: 'Fare drop on your route', body: 'ADD → LLI fares are 12% lower this weekend.', ago: '1d ago' },
  { id: 'n3', title: 'Welcome to Guxo Flights', body: 'Book, manage, and check in to your flights — all in one place.', ago: '3d ago' },
];

export function formatBirr(n: number) {
  return `ETB ${n.toLocaleString('en-US')}`;
}
