/**
 * Guxo Flights data and helpers, ported from the web prototype so both
 * behave the same: airports, fares, flight generation and formatting.
 */

export type Airport = { code: string; city: string; name: string };

export const AIRPORTS: Airport[] = [
  { code: 'ADD', city: 'Addis Ababa', name: 'Bole International Airport' },
  { code: 'DIR', city: 'Dire Dawa', name: 'Aba Tenna Dejazmach Yilma Airport' },
  { code: 'BJR', city: 'Bahir Dar', name: 'Bahir Dar Airport' },
  { code: 'GDQ', city: 'Gondar', name: 'Atse Tewodros Airport' },
  { code: 'AXU', city: 'Axum', name: 'Axum Airport' },
  { code: 'MQX', city: 'Mekelle', name: 'Alula Aba Nega Airport' },
  { code: 'JIJ', city: 'Jijiga', name: 'Wilwal Airport' },
  { code: 'ASO', city: 'Asosa', name: 'Asosa Airport' },
  { code: 'SZE', city: 'Semera', name: 'Semera Airport' },
  { code: 'GOB', city: 'Robe', name: 'Goba Airport' },
];

export const AIRLINE = { code: 'ET', name: 'Ethiopian Airlines' };

export type FareId = 'basic' | 'standard' | 'flex';
export const FARES: { id: FareId; name: string; add: number; feats: string[] }[] = [
  { id: 'basic', name: 'Basic', add: 0, feats: ['Personal item', 'Seat at check-in', 'No changes'] },
  { id: 'standard', name: 'Standard', add: 180, feats: ['Checked bag', 'Pick your seat', 'Fee to change'] },
  { id: 'flex', name: 'Flex', add: 420, feats: ['Checked bag', 'Pick your seat', 'Free changes'] },
];

export type Flight = {
  id: string;
  flightNo: string;
  dep: Date;
  arr: Date;
  durationMin: number;
  stops: number;
  layoverCity: string | null;
  layoverMin: number;
  price: number;
  seatMap: Record<string, boolean> | null;
};

export const SEAT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
export const SEAT_ROWS = 10;

/* ------------------------------------------------------------ formatting */

export const fmtPrice = (n: number) => 'ETB ' + Math.round(n).toLocaleString();
export const fmtDur = (m: number) => Math.floor(m / 60) + 'h ' + (m % 60) + 'm';
export function fmtTime(d: Date) {
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
}
export const fmtDate = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
export function fmtAgo(d: Date) {
  const mins = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return Math.round(hrs / 24) + 'd ago';
}

/* --------------------------------------------------------------- lookups */

export const airport = (code: string) => AIRPORTS.find((a) => a.code === code)!;
export const formatAirport = (a: Airport) => a.city + ' (' + a.code + ')';
export function findAirportByInput(val: string) {
  const v = (val || '').trim();
  if (!v) return null;
  const m = v.match(/\(([A-Za-z]{3})\)\s*$/);
  if (m) {
    const hit = AIRPORTS.find((a) => a.code === m[1].toUpperCase());
    if (hit) return hit;
  }
  const lower = v.toLowerCase();
  const exact = AIRPORTS.find((a) => a.city.toLowerCase() === lower || a.code.toLowerCase() === lower);
  if (exact) return exact;
  return AIRPORTS.find((a) => a.city.toLowerCase().indexOf(lower) === 0) ?? null;
}

/* ---------------------------------------------------------------- random */

const rand = (a: number, b: number) => Math.random() * (b - a) + a;
export const randInt = (a: number, b: number) => Math.floor(rand(a, b + 1));
export const pick = <T,>(arr: T[]) => arr[randInt(0, arr.length - 1)];
export const uid = () => Math.random().toString(36).slice(2, 8);

export function todayIso() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
export function addDaysIso(iso: string, days: number) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function generateFlights(origin: string, destination: string, dateStr: string): Flight[] {
  const list: Flight[] = [];
  for (let i = 0; i < 6; i++) {
    const stops = Math.random() < 0.75 ? 0 : 1;
    const baseDur = randInt(45, 120);
    const layoverMin = stops ? randInt(30, 70) : 0;
    const totalDur = baseDur + layoverMin;
    const dep = new Date(dateStr + 'T00:00:00');
    dep.setHours(randInt(5, 20), pick([0, 10, 15, 20, 30, 40, 45, 50]), 0, 0);
    const arr = new Date(dep.getTime() + totalDur * 60000);
    const price = Math.round((totalDur * 9 + rand(200, 900)) / 10) * 10;
    const layoverCity = stops ? pick(AIRPORTS.filter((a) => a.code !== origin && a.code !== destination)).code : null;
    list.push({
      id: 'FL' + i + '-' + uid(),
      flightNo: AIRLINE.code + ' ' + randInt(100, 899),
      dep,
      arr,
      durationMin: totalDur,
      stops,
      layoverCity,
      layoverMin,
      price,
      seatMap: null,
    });
  }
  return list;
}

export function cheapestPriceFor(o: string, d: string, dateStr: string) {
  return Math.min(...generateFlights(o, d, dateStr).map((f) => f.price));
}

export function withSeatMap(f: Flight): Flight {
  if (f.seatMap) return f;
  const m: Record<string, boolean> = {};
  for (let r = 1; r <= SEAT_ROWS; r++) SEAT_LETTERS.forEach((l) => (m[r + l] = Math.random() < 0.18));
  return { ...f, seatMap: m };
}

export function newPnr() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pnr = '';
  for (let i = 0; i < 6; i++) pnr += chars[randInt(0, chars.length - 1)];
  return pnr;
}

/* ------------------------------------------------ QR-like boarding code */

function strHash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** 21×21 grid of filled cells (true) with three finder squares, seeded by text. */
export function qrCells(seed: string) {
  const n = 21;
  const r = mulberry32(strHash(seed));
  const cells: boolean[][] = [];
  for (let y = 0; y < n; y++) {
    cells.push([]);
    for (let x = 0; x < n; x++) {
      const inFinder = (y < 7 && x < 7) || (y < 7 && x >= n - 7) || (y >= n - 7 && x < 7);
      cells[y].push(inFinder ? false : r() < 0.5);
    }
  }
  return cells;
}

/* --------------------------------------------------------- DOB and pw */

export function parseDobDigits(digits: string): { value?: string; error?: string } {
  if (digits.length < 8) return { error: 'Enter your full date of birth as mm/dd/yyyy.' };
  const m = +digits.slice(0, 2),
    d = +digits.slice(2, 4),
    y = +digits.slice(4, 8);
  if (m < 1 || m > 12) return { error: 'Enter a month between 01 and 12.' };
  const daysInMonth = new Date(y, m, 0).getDate();
  if (d < 1 || d > daysInMonth) return { error: "That day doesn't exist in the month you entered." };
  if (y < 1900) return { error: 'Enter a year from 1900 onward.' };
  const iso = digits.slice(4, 8) + '-' + digits.slice(0, 2) + '-' + digits.slice(2, 4);
  if (iso > todayIso()) return { error: "Date of birth can't be in the future." };
  return { value: iso };
}

export function passwordStrength(pw: string): 'weak' | 'medium' | 'strong' | null {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}

export function initialsFor(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ? parts[0][0] : '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || '?';
}

/* ----------------------------------------------------------------- cards */

export type CardBrand = 'visa' | 'mastercard' | 'debit';
export const BRAND_LABEL: Record<CardBrand, string> = { visa: 'Visa', mastercard: 'Mastercard', debit: 'Card' };
export function cardBrand(num: string): CardBrand {
  const d = String(num || '').replace(/\D/g, '');
  if (/^4/.test(d)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'mastercard';
  return 'debit';
}
export function luhnOk(d: string) {
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = +d.charAt(i);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}
export function expiryError(v: string) {
  if (!/^\d{2}\/\d{2}$/.test(v)) return 'Enter the expiry as MM/YY.';
  const m = +v.slice(0, 2);
  const y = 2000 + +v.slice(3);
  if (m < 1 || m > 12) return 'Enter an expiry month between 01 and 12.';
  const now = new Date();
  if (y < now.getFullYear() || (y === now.getFullYear() && m < now.getMonth() + 1)) return 'This card has expired.';
  return null;
}
export const formatCardNumber = (v: string) =>
  v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
export function formatExpiry(v: string) {
  let d = v.replace(/\D/g, '').slice(0, 4);
  if (d.length >= 3) d = d.slice(0, 2) + '/' + d.slice(2);
  return d;
}
