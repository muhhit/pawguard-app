import AsyncStorage from '@react-native-async-storage/async-storage';

type CacheValue<T> = { v: T; e?: number };

const mem = new Map<string, CacheValue<any>>();

export type CacheOptions = {
  ttlMs?: number; // time-to-live in milliseconds
  keyPrefix?: string;
  persist?: boolean; // also store in AsyncStorage
};

function now() { return Date.now(); }

function k(prefix: string | undefined, key: string) {
  return `${prefix ?? 'pg'}:${key}`;
}

export async function getCached<T>(key: string, loader: () => Promise<T>, opts: CacheOptions = {}): Promise<T> {
  const id = k(opts.keyPrefix, key);
  const ttl = opts.ttlMs ?? 60_000; // default 1 minute

  // memory first
  const m = mem.get(id);
  if (m && (!m.e || m.e > now())) return m.v as T;

  // try persistent
  try {
    const raw = await AsyncStorage.getItem(id);
    if (raw) {
      const obj: CacheValue<T> = JSON.parse(raw);
      if (!obj.e || obj.e > now()) {
        mem.set(id, obj);
        return obj.v as T;
      }
    }
  } catch {}

  // load fresh
  const v = await loader();
  const record: CacheValue<T> = { v, e: ttl ? now() + ttl : undefined };
  mem.set(id, record);
  if (opts.persist) {
    try { await AsyncStorage.setItem(id, JSON.stringify(record)); } catch {}
  }
  return v;
}

export function setCached<T>(key: string, value: T, opts: CacheOptions = {}) {
  const id = k(opts.keyPrefix, key);
  const ttl = opts.ttlMs ?? 60_000;
  const rec: CacheValue<T> = { v: value, e: ttl ? now() + ttl : undefined };
  mem.set(id, rec);
  if (opts.persist) {
    AsyncStorage.setItem(id, JSON.stringify(rec)).catch(() => {});
  }
}

export function clearCached(key?: string, opts: CacheOptions = {}) {
  if (!key) { mem.clear(); return; }
  const id = k(opts.keyPrefix, key);
  mem.delete(id);
  if (opts.persist) {
    AsyncStorage.removeItem(id).catch(() => {});
  }
}

