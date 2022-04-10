import { objectIs } from '../others';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ISetMappedInterface<K, KM extends RecordKeyType> {
  new (iterable: Iterable<K>, toKey: (a: K) => KM, fromKey: (k: KM) => K): void;

  // Getting information
  size: number;
  isEmpty: boolean;
  has: (key: K) => boolean;

  // Reducing a value
  every: ((predicate: (key: K) => boolean) => boolean) &
    (<L extends K>(
      predicate: (key: K) => key is L
    ) => this is ISetMapped<L, KM>);
  some: (predicate: (key: K) => boolean) => boolean;

  // Mutation
  add: (key: K) => ISetMapped<K, KM>;
  delete: (key: K) => ISetMapped<K, KM>;
  withMutations: (
    actions: readonly Readonly<
      { type: 'add'; key: K } | { type: 'delete'; key: K }
    >[]
  ) => ISetMapped<K, KM>;

  // Sequence algorithms
  map: (mapFn: (key: K) => K) => ISetMapped<K, KM>;

  filter: (predicate: (value: K) => boolean) => ISetMapped<K, KM>;

  filterNot: (predicate: (key: K) => boolean) => ISetMapped<K, KM>;

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
  toRawSet: () => ReadonlySet<KM>;
}

export type ISetMapped<K, KM extends RecordKeyType> = Iterable<K> &
  Readonly<ISetMappedInterface<K, KM>>;

export const ISetMapped = {
  new: <K, KM extends RecordKeyType>(
    iterable: Iterable<K>,
    toKey: (a: K) => KM,
    fromKey: (k: KM) => K
  ): ISetMapped<K, KM> => new ISetMappedClass<K, KM>(iterable, toKey, fromKey),

  equal: <K, KM extends RecordKeyType>(
    a: ISetMapped<K, KM>,
    b: ISetMapped<K, KM>
  ): boolean => {
    if (a.size !== b.size) return false;

    return a.every((e) => b.has(e));
  },

  diff: <K, KM extends RecordKeyType>(
    oldSet: ISetMapped<K, KM>,
    newSet: ISetMapped<K, KM>
  ): ReadonlyRecord<'added' | 'deleted', ISetMapped<K, KM>> => ({
    deleted: oldSet.subtract(newSet),
    added: newSet.subtract(oldSet),
  }),

  intersection: <K, KM extends RecordKeyType>(
    a: ISetMapped<K, KM>,
    b: ISetMapped<K, KM>
  ): ISetMapped<K, KM> => a.intersect(b),

  union: <K, KM extends RecordKeyType>(
    a: ISetMapped<K, KM>,
    b: ISetMapped<K, KM>
  ): ISetMapped<K, KM> => a.union(b),
};

class ISetMappedClass<K, KM extends RecordKeyType>
  implements ISetMapped<K, KM>, Iterable<K>
{
  readonly #set: ReadonlySet<KM>;
  readonly #toKey: (a: K) => KM;
  readonly #fromKey: (k: KM) => K;

  constructor(
    iterable: Iterable<K>,
    toKey: (a: K) => KM,
    fromKey: (k: KM) => K
  ) {
    // eslint-disable-next-line no-restricted-globals
    this.#set = new Set(Array.from(iterable, toKey));
    this.#toKey = toKey;
    this.#fromKey = fromKey;
  }

  get size(): number {
    return this.#set.size;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  has(key: K): boolean {
    return this.#set.has(this.#toKey(key));
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

  add(key: K): ISetMapped<K, KM> {
    if (this.has(key)) return this;

    return ISetMapped.new(
      [...this.#set, this.#toKey(key)].map(this.#fromKey),
      this.#toKey,
      this.#fromKey
    );
  }

  delete(key: K): ISetMapped<K, KM> {
    if (!this.has(key)) return this;
    const keyMapped = this.#toKey(key);

    return ISetMapped.new(
      // eslint-disable-next-line no-restricted-globals
      Array.from(this.#set)
        .filter((k) => !objectIs(k, keyMapped))
        .map(this.#fromKey),
      this.#toKey,
      this.#fromKey
    );
  }

  withMutations(
    actions: readonly Readonly<
      { type: 'add'; key: K } | { type: 'delete'; key: K }
    >[]
  ): ISetMapped<K, KM> {
    // eslint-disable-next-line no-restricted-globals
    const result = new Set<KM>(this.#set);

    for (const action of actions) {
      const key = this.#toKey(action.key);

      switch (action.type) {
        case 'delete':
          result.delete(key);
          break;
        case 'add':
          result.add(key);
          break;
      }
    }

    return ISetMapped.new<K, KM>(
      // eslint-disable-next-line no-restricted-globals
      Array.from(result, this.#fromKey),
      this.#toKey,
      this.#fromKey
    );
  }

  map(mapFn: (key: K) => K): ISetMapped<K, KM> {
    return ISetMapped.new(
      this.toArray().map(mapFn),
      this.#toKey,
      this.#fromKey
    );
  }

  filter(predicate: (key: K) => boolean): ISetMapped<K, KM> {
    return ISetMapped.new(
      this.toArray().filter(predicate),
      this.#toKey,
      this.#fromKey
    );
  }

  filterNot(predicate: (key: K) => boolean): ISetMapped<K, KM> {
    return ISetMapped.new(
      this.toArray().filter((k) => !predicate(k)),
      this.#toKey,
      this.#fromKey
    );
  }

  forEach(callbackfn: (key: K) => void): void {
    for (const km of this.#set) {
      callbackfn(this.#fromKey(km));
    }
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
      this.#toKey,
      this.#fromKey
    );
  }

  intersect(set: ISetMapped<K, KM>): ISetMapped<K, KM> {
    return ISetMapped.new(
      this.toArray().filter((k) => set.has(k)),
      this.#toKey,
      this.#fromKey
    );
  }

  union(set: ISetMapped<K, KM>): ISetMapped<K, KM> {
    return ISetMapped.new(
      [...this.values(), ...set.values()],
      this.#toKey,
      this.#fromKey
    );
  }

  *[Symbol.iterator](): Iterator<K> {
    for (const k of this.keys()) {
      yield k;
    }
  }

  *keys(): IterableIterator<K> {
    for (const km of this.#set.keys()) {
      yield this.#fromKey(km);
    }
  }

  *values(): IterableIterator<K> {
    for (const km of this.#set.keys()) {
      yield this.#fromKey(km);
    }
  }

  *entries(): IterableIterator<readonly [K, K]> {
    for (const km of this.#set.keys()) {
      const a = this.#fromKey(km);

      yield [a, a];
    }
  }

  toArray(): readonly K[] {
    // eslint-disable-next-line no-restricted-globals
    return Array.from(this.values());
  }

  toRawSet(): ReadonlySet<KM> {
    return this.#set;
  }
}
