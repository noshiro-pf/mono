import type { KeyValueStore } from '../src/index.mjs';

/** A `Storage` in memory, its map open to a test. */
export const memoryStore = (): KeyValueStore &
  Readonly<{ map: ReadonlyMap<string, string> }> => {
  const mut_map = new Map<string, string>();

  return {
    map: mut_map,
    getItem: (key) => mut_map.get(key) ?? null,
    setItem: (key, value) => {
      mut_map.set(key, value);
    },
    removeItem: (key) => {
      mut_map.delete(key);
    },
  };
};
