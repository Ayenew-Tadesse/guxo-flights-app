/**
 * Tiny JSON storage with a synchronous API.
 *
 * Web: localStorage (same keys as the web prototype, so an account made
 * there works here). Phones: AsyncStorage, read once at startup by
 * `hydrateStorage()` into memory, then written through on every save, so
 * the account, saved traveler and booking draft survive closing the app.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

const memory = new Map<string, string>();
const isWeb = Platform.OS === 'web';

function web() {
  try {
    if (isWeb && typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch {
    // storage blocked: fall back to memory
  }
  return null;
}

/** Phones: load these keys from the device before the app reads them (web: nothing to do). */
export async function hydrateStorage(keys: string[]) {
  if (isWeb) return;
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    pairs.forEach(([k, v]) => {
      if (v != null && !memory.has(k)) memory.set(k, v);
    });
  } catch {
    // unreadable storage: start empty, saves still work this session
  }
}

export function getRaw(key: string): string | null {
  return web()?.getItem(key) ?? memory.get(key) ?? null;
}

export function setRaw(key: string, raw: string) {
  memory.set(key, raw);
  try {
    const w = web();
    if (w) w.setItem(key, raw);
    else if (!isWeb) AsyncStorage.setItem(key, raw).catch(() => {});
  } catch {
    // storage unavailable: the in-memory copy still works this session
  }
}

export function removeRaw(key: string) {
  memory.delete(key);
  try {
    const w = web();
    if (w) w.removeItem(key);
    else if (!isWeb) AsyncStorage.removeItem(key).catch(() => {});
  } catch {
    // nothing to remove
  }
}

export function loadJson<T>(key: string): T | null {
  try {
    const raw = getRaw(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export const saveJson = (key: string, value: unknown) => setRaw(key, JSON.stringify(value));

/** The same storage for Zustand's `persist`. */
export const persistStorage: StateStorage = { getItem: getRaw, setItem: setRaw, removeItem: removeRaw };
