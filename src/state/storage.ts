/**
 * Tiny JSON storage: localStorage on web (same keys as the web prototype,
 * so an account made there works here), memory on native for now.
 */
const memory = new Map<string, string>();

function backend() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch {
    // storage blocked: fall back to memory
  }
  return null;
}

export function loadJson<T>(key: string): T | null {
  try {
    const raw = backend()?.getItem(key) ?? memory.get(key) ?? null;
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveJson(key: string, value: unknown) {
  const raw = JSON.stringify(value);
  memory.set(key, raw);
  try {
    backend()?.setItem(key, raw);
  } catch {
    // storage unavailable: the in-memory copy still works this session
  }
}
