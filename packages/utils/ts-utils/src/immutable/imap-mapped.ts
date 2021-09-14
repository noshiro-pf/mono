import { ituple } from '../others';
import type { KeyBaseType } from './key-base-type';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface IMapMappedInterface<K, V, KM extends KeyBaseType> {
  new (iterable: Iterable<K>, toKey: (a: K) => KM, fromKey: (k: KM) => K): void;

  // Getting information
  size: number;
  has: (key: K) => boolean;
  get: (key: K) => V | undefined;

  // Reducing a value
  every: ((predicate: (value: V, key: K) => boolean) => boolean) &
    (<W extends V>(
      predicate: (value: V, key: K) => value is W
    ) => this is IMapMapped<K, W, KM>);
  some: (predicate: (value: V, key: K) => boolean) => boolean;

  // Mutation
  delete: (key: K) => IMapMapped<K, V, KM>;
  set: (key: K, value: V) => IMapMapped<K, V, KM>;
  update: (key: K, updater: (value: V) => V) => IMapMapped<K, V, KM>;
  withMutations: (
    actions: readonly Readonly<
      | { type: 'delete'; key: K }
      | { type: 'set'; key: K; value: V }
      | { type: 'update'; key: K; updater: (value: V) => V }
    >[]
  ) => IMapMapped<K, V, KM>;

  // Sequence algorithms
  map: <V2>(mapFn: (value: V, key: K) => V2) => IMapMapped<K, V2, KM>;
  // toKey と fromKey が使えなくなるので key の型は変更できない。
  mapKeys: (mapFn: (key: K) => K) => IMapMapped<K, V, KM>;
  mapEntries: <V2>(
    mapFn: (entry: readonly [K, V]) => readonly [K, V2]
  ) => IMapMapped<K, V2, KM>;

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
}

export type IMapMapped<K, V, KM extends KeyBaseType> = Iterable<
  readonly [K, V]
> &
  Readonly<IMapMappedInterface<K, V, KM>>;

export const IMapMapped = {
  new: <K, V, KM extends KeyBaseType>(
    iterable: Iterable<readonly [K, V]>,
    toKey: (a: K) => KM,
    fromKey: (k: KM) => K
  ): IMapMapped<K, V, KM> =>
    new IMapMappedClass<K, V, KM>(iterable, toKey, fromKey),

  equal: <K, V, KM extends KeyBaseType>(
    a: IMapMapped<K, V, KM>,
    b: IMapMapped<K, V, KM>
  ): boolean => {
    if (a.size !== b.size) return false;
    return a.every((v, k) => b.get(k) === v);
  },
};

class IMapMappedClass<K, V, KM extends KeyBaseType>
  implements IMapMapped<K, V, KM>, Iterable<readonly [K, V]>
{
  private readonly _map: ReadonlyMap<KM, V>;
  private readonly _toKey: (a: K) => KM;
  private readonly _fromKey: (k: KM) => K;

  constructor(
    iterable: Iterable<readonly [K, V]>,
    toKey: (a: K) => KM,
    fromKey: (k: KM) => K
  ) {
    this._map = new Map([...iterable].map(([k, v]) => [toKey(k), v]));
    this._toKey = toKey;
    this._fromKey = fromKey;
  }

  get size(): number {
    return this._map.size;
  }

  has(key: K): boolean {
    return this._map.has(this._toKey(key));
  }

  get(key: K): V | undefined {
    return this._map.get(this._toKey(key));
  }

  every<W extends V>(
    predicate: (value: V, key: K) => value is W
  ): this is IMapMapped<K, W, KM>;
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

  delete(key: K): IMapMapped<K, V, KM> {
    if (!this.has(key)) return this;
    const keyMapped = this._toKey(key);

    return IMapMapped.new(
      [...this._map]
        .filter(([km]) => !Object.is(km, keyMapped))
        .map(([km, v]) => ituple(this._fromKey(km), v)),
      this._toKey,
      this._fromKey
    );
  }

  set(key: K, value: V): IMapMapped<K, V, KM> {
    const curr = this.get(key);
    if (curr === value) return this;
    const keyMapped = this._toKey(key);
    if (curr === undefined) {
      return IMapMapped.new(
        [...this._map, ituple(keyMapped, value)].map(([km, v]) =>
          ituple(this._fromKey(km), v)
        ),
        this._toKey,
        this._fromKey
      );
    } else {
      return IMapMapped.new(
        [...this._map].map(([km, v]) =>
          ituple(this._fromKey(km), Object.is(km, keyMapped) ? value : v)
        ),
        this._toKey,
        this._fromKey
      );
    }
  }

  update(key: K, updater: (value: V) => V): IMapMapped<K, V, KM> {
    const curr = this.get(key);
    if (curr === undefined) return this;
    const keyMapped = this._toKey(key);

    return IMapMapped.new(
      [...this._map]
        .map(([km, v]) =>
          ituple(km, Object.is(km, keyMapped) ? updater(curr) : v)
        )
        .map(([km, v]) => ituple(this._fromKey(km), v)),
      this._toKey,
      this._fromKey
    );
  }

  withMutations(
    actions: readonly Readonly<
      | { type: 'delete'; key: K }
      | { type: 'set'; key: K; value: V }
      | { type: 'update'; key: K; updater: (value: V) => V }
    >[]
  ): IMapMapped<K, V, KM> {
    const result = new Map<KM, V>(this._map);
    for (const action of actions) {
      const key = this._toKey(action.key);
      switch (action.type) {
        case 'delete':
          result.delete(key);
          break;
        case 'set':
          result.set(key, action.value);
          break;
        case 'update': {
          const curr = result.get(key);
          if (curr !== undefined) {
            result.set(key, action.updater(curr));
          }
          break;
        }
      }
    }
    return IMapMapped.new<K, V, KM>(
      [...result].map(([k, v]) => [this._fromKey(k), v]),
      this._toKey,
      this._fromKey
    );
  }

  map<V2>(mapFn: (value: V, key: K) => V2): IMapMapped<K, V2, KM> {
    return IMapMapped.new(
      this.toArray().map(([k, v]) => ituple(k, mapFn(v, k))),
      this._toKey,
      this._fromKey
    );
  }

  mapKeys(mapFn: (key: K) => K): IMapMapped<K, V, KM> {
    return IMapMapped.new(
      this.toArray().map(([k, v]) => ituple(mapFn(k), v)),
      this._toKey,
      this._fromKey
    );
  }

  mapEntries<V2>(
    mapFn: (entry: readonly [K, V]) => readonly [K, V2]
  ): IMapMapped<K, V2, KM> {
    return IMapMapped.new(
      this.toArray().map(mapFn),
      this._toKey,
      this._fromKey
    );
  }

  forEach(callbackfn: (value: V, key: K) => void): void {
    this._map.forEach((value, km) => {
      callbackfn(value, this._fromKey(km));
    });
  }

  *[Symbol.iterator](): Iterator<readonly [K, V]> {
    for (const e of this.entries()) {
      yield e;
    }
  }

  *keys(): IterableIterator<K> {
    for (const km of this._map.keys()) {
      yield this._fromKey(km);
    }
  }

  *values(): IterableIterator<V> {
    for (const v of this._map.values()) {
      yield v;
    }
  }

  *entries(): IterableIterator<readonly [K, V]> {
    for (const [km, v] of this._map.entries()) {
      yield [this._fromKey(km), v];
    }
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
}
