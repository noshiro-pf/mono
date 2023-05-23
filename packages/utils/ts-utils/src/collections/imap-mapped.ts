/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { pipe } from '../functional';
import { tp } from '../others';

type KeyType = number | string;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface IMapMappedInterface<K, V, KM extends KeyType> {
  new (iterable: Iterable<K>, toKey: (a: K) => KM, fromKey: (k: KM) => K): void;

  // Getting information
  size: SafeUint;
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
  toRawMap: () => ReadonlyMap<KM, V>;
}

export type IMapMapped<K, V, KM extends KeyType> = Iterable<readonly [K, V]> &
  Readonly<IMapMappedInterface<K, V, KM>>;

export const IMapMapped = {
  new: <K, V, KM extends KeyType>(
    iterable: Iterable<readonly [K, V]>,
    toKey: (a: K) => KM,
    fromKey: (k: KM) => K
  ): IMapMapped<K, V, KM> =>
    new IMapMappedClass<K, V, KM>(iterable, toKey, fromKey),

  equal: <K, V, KM extends KeyType>(
    a: IMapMapped<K, V, KM>,
    b: IMapMapped<K, V, KM>
  ): boolean => {
    if (a.size !== b.size) return false;

    return a.every((v, k) => b.get(k) === v);
  },
};

const ArrayFrom = Array.from;

class IMapMappedClass<K, V, KM extends KeyType>
  implements IMapMapped<K, V, KM>, Iterable<readonly [K, V]>
{
  readonly #map: ReadonlyMap<KM, V>;
  readonly #toKey: (a: K) => KM;
  readonly #fromKey: (k: KM) => K;

  constructor(
    iterable: Iterable<readonly [K, V]>,
    toKey: (a: K) => KM,
    fromKey: (k: KM) => K
  ) {
    // eslint-disable-next-line no-restricted-globals
    this.#map = new Map(ArrayFrom(iterable, ([k, v]) => [toKey(k), v]));
    this.#toKey = toKey;
    this.#fromKey = fromKey;
  }

  get size(): SafeUint {
    return this.#map.size;
  }

  has(key: K): boolean {
    return this.#map.has(this.#toKey(key));
  }

  get(key: K): V | undefined {
    return this.#map.get(this.#toKey(key));
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
    if (!this.has(key)) {
      console.warn(`IMapMapped.delete: key not found: ${this.#toKey(key)}`);
      return this;
    }
    const keyMapped = this.#toKey(key);

    return IMapMapped.new(
      ArrayFrom(this.#map)
        .filter(([km]) => !Object.is(km, keyMapped))
        .map(([km, v]) => tp(this.#fromKey(km), v)),
      this.#toKey,
      this.#fromKey
    );
  }

  set(key: K, value: V): IMapMapped<K, V, KM> {
    if (value === this.get(key)) return this; // has no changes
    const keyMapped = this.#toKey(key);

    if (!this.has(key)) {
      return IMapMapped.new(
        [...this.#map, tp(keyMapped, value)].map(([km, v]) =>
          tp(this.#fromKey(km), v)
        ),
        this.#toKey,
        this.#fromKey
      );
    } else {
      return IMapMapped.new(
        ArrayFrom(this.#map, ([km, v]) =>
          tp(this.#fromKey(km), Object.is(km, keyMapped) ? value : v)
        ),
        this.#toKey,
        this.#fromKey
      );
    }
  }

  update(key: K, updater: (value: V) => V): IMapMapped<K, V, KM> {
    if (!this.has(key)) {
      console.error(`IMapMapped.update: key not found: ${this.#toKey(key)}`);
      return this;
    }

    const curr = this.get(key)!;
    const keyMapped = this.#toKey(key);

    return IMapMapped.new(
      ArrayFrom(
        this.#map.entries(),
        (keyValue) =>
          pipe(keyValue)
            .chain(([km, v]) =>
              tp(km, Object.is(km, keyMapped) ? updater(curr) : v)
            )
            .chain(([km, v]) => tp(this.#fromKey(km), v)).value
      ),
      this.#toKey,
      this.#fromKey
    );
  }

  withMutations(
    actions: readonly Readonly<
      | { type: 'delete'; key: K }
      | { type: 'set'; key: K; value: V }
      | { type: 'update'; key: K; updater: (value: V) => V }
    >[]
  ): IMapMapped<K, V, KM> {
    // eslint-disable-next-line no-restricted-globals
    const mut_result = new Map<KM, V>(this.#map);

    for (const action of actions) {
      const key = this.#toKey(action.key);

      switch (action.type) {
        case 'delete':
          mut_result.delete(key);
          break;

        case 'set':
          mut_result.set(key, action.value);
          break;

        case 'update': {
          if (mut_result.has(key)) {
            mut_result.set(key, action.updater(mut_result.get(key)!));
          } else {
            console.warn(
              `IMapMapped.withMutations::update: key not found: ${this.#toKey(
                key
              )}`
            );
          }
          break;
        }
      }
    }

    return IMapMapped.new<K, V, KM>(
      ArrayFrom(mut_result, ([k, v]) => [this.#fromKey(k), v]),
      this.#toKey,
      this.#fromKey
    );
  }

  map<V2>(mapFn: (value: V, key: K) => V2): IMapMapped<K, V2, KM> {
    return IMapMapped.new(
      this.toArray().map(([k, v]) => tp(k, mapFn(v, k))),
      this.#toKey,
      this.#fromKey
    );
  }

  mapKeys(mapFn: (key: K) => K): IMapMapped<K, V, KM> {
    return IMapMapped.new(
      this.toArray().map(([k, v]) => tp(mapFn(k), v)),
      this.#toKey,
      this.#fromKey
    );
  }

  mapEntries<V2>(
    mapFn: (entry: readonly [K, V]) => readonly [K, V2]
  ): IMapMapped<K, V2, KM> {
    return IMapMapped.new(
      this.toArray().map(mapFn),
      this.#toKey,
      this.#fromKey
    );
  }

  forEach(callbackfn: (value: V, key: K) => void): void {
    for (const [km, value] of this.#map.entries()) {
      callbackfn(value, this.#fromKey(km));
    }
  }

  *[Symbol.iterator](): Iterator<readonly [K, V]> {
    for (const e of this.entries()) {
      yield e;
    }
  }

  *keys(): IterableIterator<K> {
    for (const km of this.#map.keys()) {
      yield this.#fromKey(km);
    }
  }

  *values(): IterableIterator<V> {
    for (const v of this.#map.values()) {
      yield v;
    }
  }

  *entries(): IterableIterator<readonly [K, V]> {
    for (const [km, v] of this.#map.entries()) {
      yield [this.#fromKey(km), v];
    }
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

  toRawMap(): ReadonlyMap<KM, V> {
    return this.#map;
  }
}
