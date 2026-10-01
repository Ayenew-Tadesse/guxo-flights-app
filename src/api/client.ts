/**
 * The API client: every network call goes through `request()`. It adds the
 * base URL and headers, gives up after a timeout, parses JSON and turns
 * every failure into an `ApiError` the screens can show kindly. When the
 * backend changes, this is the one file to change.
 *
 * Until there's a backend (no EXPO_PUBLIC_API_URL), requests are answered
 * by mock routes registered with `mockRoute()`. They still go through the
 * same steps (connection check, timeout, JSON parsing), so screens behave
 * exactly as they will against the real API, offline included.
 */
import { getNetworkStateAsync } from 'expo-network';

export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'parse';

const MESSAGES: Record<ApiErrorKind, string> = {
  network: 'You’re offline. Check your connection and try again.',
  timeout: 'This is taking longer than usual. Please try again.',
  http: 'Something went wrong on our side. Please try again in a moment.',
  parse: 'We got an unexpected answer from the server. Please try again.',
};

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** The HTTP status, for `http` errors. */
  readonly status?: number;
  constructor(kind: ApiErrorKind, detail?: string, status?: number) {
    super(detail ? `${kind}: ${detail}` : kind);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
  /** What to show the traveller. */
  get friendly() {
    return MESSAGES[this.kind];
  }
}

/** A message for any error a request can throw. */
export const friendlyMessage = (e: unknown) => (e instanceof ApiError ? e.friendly : MESSAGES.http);

type Query = Record<string, string | number | boolean | null | undefined>;
export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Query;
  body?: unknown;
  headers?: Record<string, string>;
  /** Give up after this long (default 10 seconds). */
  timeoutMs?: number;
  /** Cancel from outside (e.g. the screen closed). */
  signal?: AbortSignal;
};

export const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
const DEFAULT_TIMEOUT = 10_000;
// How long mock answers take, like a real server (EXPO_PUBLIC_API_MOCK_DELAY_MS to try slow networks).
const MOCK_DELAY = Number(process.env.EXPO_PUBLIC_API_MOCK_DELAY_MS ?? 450) || 0;

/* ------------------------------------------------------------- mocks */

type MockHandler = (query: Record<string, string>, body: unknown) => unknown;
const mocks = new Map<string, MockHandler>();

/** Answer `method path` with mock data while there's no backend. */
export function mockRoute(method: NonNullable<RequestOptions['method']>, path: string, handler: MockHandler) {
  mocks.set(`${method} ${path}`, handler);
}

function mockFetch(method: string, path: string, query: Record<string, string>, body: unknown, signal: AbortSignal): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const handler = mocks.get(`${method} ${path}`);
      if (!handler) return resolve({ status: 404, text: JSON.stringify({ error: 'not found' }) });
      try {
        // Through JSON, like a real response (dates become strings).
        resolve({ status: 200, text: JSON.stringify(handler(query, body)) });
      } catch {
        resolve({ status: 500, text: JSON.stringify({ error: 'mock failed' }) });
      }
    }, MOCK_DELAY);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason ?? new Error('aborted'));
    });
  });
}

/* ----------------------------------------------------------- request */

// Offline (Wi-Fi off, airplane mode): fail fast with a clear error.
async function ensureOnline() {
  let state;
  try {
    state = await getNetworkStateAsync();
  } catch {
    return; // can't tell: let the request try
  }
  if (state.isConnected === false || state.isInternetReachable === false) throw new ApiError('network', 'no connection');
}

const toQuery = (q: Query = {}) =>
  Object.fromEntries(Object.entries(q).filter(([, v]) => v !== null && v !== undefined).map(([k, v]) => [k, String(v)]));

/** Call the API and get typed JSON back; throws `ApiError`. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers, timeoutMs = DEFAULT_TIMEOUT, signal } = options;
  const query = toQuery(options.query);
  await ensureOnline();

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const cancel = () => controller.abort(signal?.reason);
  if (signal?.aborted) cancel();
  else signal?.addEventListener('abort', cancel);

  let res: { status: number; text: string };
  try {
    if (!BASE_URL) {
      res = await mockFetch(method, path, query, body, controller.signal);
    } else {
      const qs = new URLSearchParams(query).toString();
      const r = await fetch(BASE_URL + path + (qs ? '?' + qs : ''), {
        method,
        headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      res = { status: r.status, text: await r.text() };
    }
  } catch (e) {
    if (timedOut) throw new ApiError('timeout', `${method} ${path} after ${timeoutMs}ms`);
    if (signal?.aborted) throw e; // cancelled by the caller: not an error to show
    throw new ApiError('network', e instanceof Error ? e.message : String(e));
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }

  if (res.status < 200 || res.status >= 300) throw new ApiError('http', `${method} ${path} → ${res.status}`, res.status);
  if (!res.text) return undefined as T;
  try {
    return JSON.parse(res.text) as T;
  } catch {
    throw new ApiError('parse', `${method} ${path}: not JSON`);
  }
}
