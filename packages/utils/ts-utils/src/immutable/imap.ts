import { ituple } from '../others';
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
}

export type IMap<K, V> = Iterable<readonly [K, V]> &
  Readonly<IMapInterface<K, V>>;

export const IMap = {
  new: <K, V>(iterable: Iterable<readonly [K, V]>): IMap<K, V> =>
    new IMapClass<K, V>(iterable),

  equal: <K, V>(a: IMap<K, V>, b: IMap<K, V>): boolean => {
    if (a.size !== b.size) return false;
    return a.every((v, k) => b.get(k) === v);
  },
};

class IMapClass<K, V> implements IMap<K, V>, Iterable<readonly [K, V]> {
  private readonly _map: ReadonlyMap<K, V>;

  constructor(iterable: Iterable<readonly [K, V]>) {
    this._map = new Map(iterable);
  }

  get size(): number {
    return this._map.size;
  }

  has(key: K): boolean {
    return this._map.has(key);
  }

  get(key: K): V | undefined {
    return this._map.get(key);
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
    return IMap.new([...this._map].filter(([k]) => !Object.is(k, key)));
  }

  set(key: K, value: V): IMap<K, V> {
    const curr = this.get(key);
    if (curr === value) return this;
    if (curr === undefined) {
      return IMap.new([...this._map, ituple(key, value)]);
    } else {
      return IMap.new(
        [...this._map].map(([k, v]) => ituple(k, Object.is(k, key) ? value : v))
      );
    }
  }

  update(key: K, updater: (value: V) => V): IMap<K, V> {
    const curr = this.get(key);
    if (curr === undefined) return this;
    return IMap.new(
      [...this._map].map(([k, v]) =>
        ituple(k, Object.is(k, key) ? updater(curr) : v)
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
    const result = new Map<K, V>(this._map);
    for (const action of actions) {
      switch (action.type) {
        case 'delete':
          result.delete(action.key);
          break;
        case 'set':
          result.set(action.key, action.value);
          break;
        case 'update': {
          const curr = result.get(action.key);
          if (curr !== undefined) {
            result.set(action.key, action.updater(curr));
          }
          break;
        }
      }
    }
    return IMap.new(result);
  }

  map<V2>(mapFn: (value: V, key: K) => V2): IMap<K, V2> {
    return IMap.new(this.toArray().map(([k, v]) => ituple(k, mapFn(v, k))));
  }

  mapKeys<K2>(mapFn: (key: K) => K2): IMap<K2, V> {
    return IMap.new(this.toArray().map(([k, v]) => ituple(mapFn(k), v)));
  }

  mapEntries<K2, V2>(
    mapFn: (entry: readonly [K, V]) => readonly [K2, V2]
  ): IMap<K2, V2> {
    return IMap.new(this.toArray().map(mapFn));
  }

  forEach(callbackfn: (value: V, key: K) => void): void {
    this._map.forEach(callbackfn);
  }

  [Symbol.iterator](): Iterator<readonly [K, V]> {
    return this._map[Symbol.iterator]();
  }

  keys(): IterableIterator<K> {
    return this._map.keys();
  }

  values(): IterableIterator<V> {
    return this._map.values();
  }

  entries(): IterableIterator<readonly [K, V]> {
    return this._map.entries();
  }

  toKeysArray(): readonly K[] {
    return [...this.keys()];
  }

  toValuesArray(): readonly V[] {
    return [...this.values()];
  }

  toEntriesArray(): readonly (readonly [K, V])[] {
    return [...this.entries()];
  }

  toArray(): readonly (readonly [K, V])[] {
    return [...this.entries()];
  }

  toSet(): ISet<V> {
    return ISet.new(this.values());
  }
}
