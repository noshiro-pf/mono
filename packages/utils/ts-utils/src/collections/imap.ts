import { MutableMap, tp } from '../others';
import { ISet } from './iset';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface IMapInterface<K, V> {
  new (iterable: Iterable<K>): void;

  // Getting information
  size: number;
  has: (key: K) => boolean;
  get: (key: K) => V | undefined;

  // Reducing a value
  every: ((predicate: (value: V, key: K) => boolean) => boolean) &
    (<W extends V>(
      predicate: (value: V, key: K) => value is W
    ) => this is IMap<K, W>);
  some: (predicate: (value: V, key: K) => boolean) => boolean;

  // Mutation
  delete: (key: K) => IMap<K, V>;
  set: (key: K, value: V) => IMap<K, V>;
  update: (key: K, updater: (value: V) => V) => IMap<K, V>;
  withMutations: (
    actions: readonly Readonly<
      | { type: 'delete'; key: K }
      | { type: 'set'; key: K; value: V }
      | { type: 'update'; key: K; updater: (value: V) => V }
    >[]
  ) => IMap<K, V>;

  // Sequence algorithms
  map: <V2>(mapFn: (value: V, key: K) => V2) => IMap<K, V2>;
  mapKeys: <K2>(mapFn: (key: K) => K2) => IMap<K2, V>;
  mapEntries: <K2, V2>(
    mapFn: (entry: readonly [K, V]) => readonly [K2, V2]
  ) => IMap<K2, V2>;

  // Side effects
  forEach: (callbackfn: (value: V, key: K) => void) => void;

  // Iterators
  keys: () => IterableIterator<K>;
  values: () => IterableIterator<V>;
  entries: () => IterableIterator<readonly [K, V]>;

  // Conversion
  toKeysArray: () => readonly K[];
  toValuesArray: () => readonly V[];
  toEntriesArray: () => readonly (readonly [K, V])[];
  toArray: () => readonly (readonly [K, V])[];
  toSet: () => ISet<V>;
  toRawMap: () => ReadonlyMap<K, V>;
}

export type IMap<K, V> = Iterable<readonly [K, V]> &
  Readonly<IMapInterface<K, V>>;

// eslint-disable-next-line no-restricted-globals
const ArrayFrom = Array.from;

export const IMap = {
  new: <K, V>(iterable: Iterable<readonly [K, V]>): IMap<K, V> =>
    new IMapClass<K, V>(iterable),

  equal: <K, V>(a: IMap<K, V>, b: IMap<K, V>): boolean => {
    if (a.size !== b.size) return false;

    return a.every((v, k) => b.get(k) === v);
  },
};

class IMapClass<K, V> implements IMap<K, V>, Iterable<readonly [K, V]> {
  readonly #map: ReadonlyMap<K, V>;

  constructor(iterable: Iterable<readonly [K, V]>) {
    this.#map = new MutableMap(iterable);
  }

  get size(): number {
    return this.#map.size;
  }

  has(key: K): boolean {
    return this.#map.has(key);
  }

  get(key: K): V | undefined {
    return this.#map.get(key);
  }

  every<W extends V>(
    predicate: (value: V, key: K) => value is W
  ): this is IMap<K, W>;
  every(predicate: (value: V, key: K) => boolean): boolean;
  every(predicate: (value: V, key: K) => boolean): boolean {
    for (const [k, v] of this.entries()) {
      if (!predicate(v, k)) return false;
    }

    return true;
  }

  some(predicate: (value: V, key: K) => boolean): boolean {
    for (const [k, v] of this.entries()) {
      if (predicate(v, k)) return true;
    }

    return false;
  }

  delete(key: K): IMap<K, V> {
    if (!this.has(key)) return this;

    return IMap.new(ArrayFrom(this.#map).filter(([k]) => !Object.is(k, key)));
  }

  set(key: K, value: V): IMap<K, V> {
    if (value === this.get(key)) return this; // has no changes
    if (!this.has(key)) {
      return IMap.new([...this.#map, tp(key, value)]);
    } else {
      return IMap.new(
        ArrayFrom(this.#map, ([k, v]) => tp(k, Object.is(k, key) ? value : v))
      );
    }
  }

  update(key: K, updater: (value: V) => V): IMap<K, V> {
    if (!this.has(key)) return this;
    const curr = this.get(key);

    return IMap.new(
      ArrayFrom(this.#map, ([k, v]) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        tp(k, Object.is(k, key) ? updater(curr!) : v)
      )
    );
  }

  withMutations(
    actions: readonly Readonly<
      | { type: 'delete'; key: K }
      | { type: 'set'; key: K; value: V }
      | { type: 'update'; key: K; updater: (value: V) => V }
    >[]
  ): IMap<K, V> {
    const mut_result = new MutableMap<K, V>(this.#map);

    for (const action of actions) {
      switch (action.type) {
        case 'delete':
          mut_result.delete(action.key);
          break;
        case 'set':
          mut_result.set(action.key, action.value);
          break;
        case 'update': {
          if (mut_result.has(action.key)) {
            mut_result.set(
              action.key,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              action.updater(mut_result.get(action.key)!)
            );
          }
          break;
        }
      }
    }

    return IMap.new(mut_result);
  }

  map<V2>(mapFn: (value: V, key: K) => V2): IMap<K, V2> {
    return IMap.new(this.toArray().map(([k, v]) => tp(k, mapFn(v, k))));
  }

  mapKeys<K2>(mapFn: (key: K) => K2): IMap<K2, V> {
    return IMap.new(this.toArray().map(([k, v]) => tp(mapFn(k), v)));
  }

  mapEntries<K2, V2>(
    mapFn: (entry: readonly [K, V]) => readonly [K2, V2]
  ): IMap<K2, V2> {
    return IMap.new(this.toArray().map(mapFn));
  }

  forEach(callbackfn: (value: V, key: K) => void): void {
    for (const [key, value] of this.#map.entries()) {
      callbackfn(value, key);
    }
  }

  [Symbol.iterator](): Iterator<readonly [K, V]> {
    return this.#map[Symbol.iterator]();
  }

  keys(): IterableIterator<K> {
    return this.#map.keys();
  }

  values(): IterableIterator<V> {
    return this.#map.values();
  }

  entries(): IterableIterator<readonly [K, V]> {
    return this.#map.entries();
  }

  toKeysArray(): readonly K[] {
    return ArrayFrom(this.keys());
  }

  toValuesArray(): readonly V[] {
    return ArrayFrom(this.values());
  }

  toEntriesArray(): readonly (readonly [K, V])[] {
    return ArrayFrom(this.entries());
  }

  toArray(): readonly (readonly [K, V])[] {
    return ArrayFrom(this.entries());
  }

  toSet(): ISet<V> {
    return ISet.new(this.values());
  }

  toRawMap(): ReadonlyMap<K, V> {
    return this.#map;
  }
}
