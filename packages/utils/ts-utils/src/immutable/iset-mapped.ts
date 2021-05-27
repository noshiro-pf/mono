import type { uint32 } from '../types';
import type { KeyBaseType } from './key-base-type';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ISetMappedInterface<K, KM extends KeyBaseType> {
  new (iterable: Iterable<K>, toKey: (a: K) => KM, fromKey: (k: KM) => K): void;

  // Getting information
  size: uint32;
  has: (key: K) => boolean;

  // Reducing a value
  every: ((predicate: (key: K) => boolean) => boolean) &
    (<L extends K>(
      predicate: (key: K) => key is L
    ) => this is ISetMapped<L, KM>);
  some: (predicate: (key: K) => boolean) => boolean;

  // Mutation
  delete: (key: K) => ISetMapped<K, KM>;
  add: (key: K) => ISetMapped<K, KM>;

  // Sequence algorithms
  map: (mapFn: (key: K) => K) => ISetMapped<K, KM>;

  // Side effects
  forEach: (callbackfn: (key: K) => void) => void;

  // Comparison
  isSubsetOf: (set: ISetMapped<K, KM>) => boolean;
  isSupersetOf: (set: ISetMapped<K, KM>) => boolean;
  subtract: (set: ISetMapped<K, KM>) => ISetMapped<K, KM>;
  intersect: (set: ISetMapped<K, KM>) => ISetMapped<K, KM>;
  union: (set: ISetMapped<K, KM>) => ISetMapped<K, KM>;

  // Iterators
  keys: () => IterableIterator<K>;
  values: () => IterableIterator<K>;
  entries: () => IterableIterator<readonly [K, K]>;

  // Conversion
  toArray: () => readonly K[];
}

export type ISetMapped<K, KM extends KeyBaseType> = Iterable<K> &
  Readonly<ISetMappedInterface<K, KM>>;

export const ISetMapped = {
  new: <K, KM extends KeyBaseType>(
    iterable: Iterable<K>,
    toKey: (a: K) => KM,
    fromKey: (k: KM) => K
  ): ISetMapped<K, KM> => new ISetMappedClass<K, KM>(iterable, toKey, fromKey),
  equal: <K, KM extends KeyBaseType>(
    a: ISetMapped<K, KM>,
    b: ISetMapped<K, KM>
  ): boolean => {
    if (a.size !== b.size) return false;
    return a.every((e) => b.has(e));
  },
};

class ISetMappedClass<K, KM extends KeyBaseType>
  implements ISetMapped<K, KM>, Iterable<K>
{
  private readonly _set: ReadonlySet<KM>;
  private readonly _toKey: (a: K) => KM;
  private readonly _fromKey: (k: KM) => K;

  constructor(
    iterable: Iterable<K>,
    toKey: (a: K) => KM,
    fromKey: (k: KM) => K
  ) {
    this._set = new Set([...iterable].map(toKey));
    this._toKey = toKey;
    this._fromKey = fromKey;
  }

  get size(): uint32 {
    return this._set.size as uint32;
  }

  has(key: K): boolean {
    return this._set.has(this._toKey(key));
  }

  every<L extends K>(
    predicate: (key: K) => key is L
  ): this is ISetMapped<L, KM>;
  every(predicate: (key: K) => boolean): boolean;
  every(predicate: (key: K) => boolean): boolean {
    for (const key of this.values()) {
      if (!predicate(key)) return false;
    }
    return true;
  }

  some(predicate: (key: K) => boolean): boolean {
    for (const key of this.values()) {
      if (predicate(key)) return true;
    }
    return false;
  }

  delete(key: K): ISetMapped<K, KM> {
    if (!this.has(key)) return this;
    const keyMapped = this._toKey(key);
    return ISetMapped.new(
      [...this._set].filter((k) => !Object.is(k, keyMapped)).map(this._fromKey),
      this._toKey,
      this._fromKey
    );
  }

  add(key: K): ISetMapped<K, KM> {
    if (this.has(key)) return this;
    return ISetMapped.new(
      [...this._set, this._toKey(key)].map(this._fromKey),
      this._toKey,
      this._fromKey
    );
  }

  map(mapFn: (key: K) => K): ISetMapped<K, KM> {
    return ISetMapped.new(
      this.toArray().map(mapFn),
      this._toKey,
      this._fromKey
    );
  }

  forEach(callbackfn: (key: K) => void): void {
    this._set.forEach((km) => {
      callbackfn(this._fromKey(km));
    });
  }

  isSubsetOf(set: ISetMapped<K, KM>): boolean {
    return this.every((k) => set.has(k));
  }

  isSupersetOf(set: ISetMapped<K, KM>): boolean {
    return set.every((k) => (this as ISetMapped<K, KM>).has(k));
  }

  subtract(set: ISetMapped<K, KM>): ISetMapped<K, KM> {
    return ISetMapped.new(
      this.toArray().filter((k) => !set.has(k)),
      this._toKey,
      this._fromKey
    );
  }

  intersect(set: ISetMapped<K, KM>): ISetMapped<K, KM> {
    return ISetMapped.new(
      this.toArray().filter((k) => set.has(k)),
      this._toKey,
      this._fromKey
    );
  }

  union(set: ISetMapped<K, KM>): ISetMapped<K, KM> {
    return ISetMapped.new(
      [...this.values(), ...set.values()],
      this._toKey,
      this._fromKey
    );
  }

  *[Symbol.iterator](): Iterator<K> {
    for (const k of this.keys()) {
      yield k;
    }
  }

  *keys(): IterableIterator<K> {
    for (const km of this._set.keys()) {
      yield this._fromKey(km);
    }
  }

  *values(): IterableIterator<K> {
    for (const km of this._set.keys()) {
      yield this._fromKey(km);
    }
  }

  *entries(): IterableIterator<readonly [K, K]> {
    for (const km of this._set.keys()) {
      const a = this._fromKey(km);
      yield [a, a];
    }
  }

  toArray(): readonly K[] {
    return [...this.values()];
  }
}
