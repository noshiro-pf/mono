type SetKeyType = number | string;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ISetMappedInterface<K, KM extends SetKeyType> {
  new (iterable: Iterable<K>, toKey: (a: K) => KM, fromKey: (k: KM) => K): void;

  // Getting information
  readonly size: NumberType.ArraySize;
  readonly isEmpty: boolean;
  readonly has: (key: K) => boolean;

  // Reducing a value
  readonly every: ((predicate: (key: K) => boolean) => boolean) &
    (<L extends K>(
      predicate: (key: K) => key is L,
    ) => this is ISetMapped<L, KM>);
  readonly some: (predicate: (key: K) => boolean) => boolean;

  // Mutation
  readonly add: (key: K) => ISetMapped<K, KM>;
  readonly delete: (key: K) => ISetMapped<K, KM>;
  readonly withMutations: (
    actions: readonly Readonly<
      | {
          type: 'add';
          key: K;
        }
      | {
          type: 'delete';
          key: K;
        }
    >[],
  ) => ISetMapped<K, KM>;

  // Sequence algorithms
  readonly map: (mapFn: (key: K) => K) => ISetMapped<K, KM>;

  readonly filter: (predicate: (value: K) => boolean) => ISetMapped<K, KM>;

  readonly filterNot: (predicate: (key: K) => boolean) => ISetMapped<K, KM>;

  // Side effects
  readonly forEach: (callbackfn: (key: K) => void) => void;

  // Comparison
  readonly isSubsetOf: (set: ISetMapped<K, KM>) => boolean;
  readonly isSupersetOf: (set: ISetMapped<K, KM>) => boolean;
  readonly subtract: (set: ISetMapped<K, KM>) => ISetMapped<K, KM>;
  readonly intersect: (set: ISetMapped<K, KM>) => ISetMapped<K, KM>;
  readonly union: (set: ISetMapped<K, KM>) => ISetMapped<K, KM>;

  // Iterators
  readonly keys: () => IterableIterator<K>;
  readonly values: () => IterableIterator<K>;
  readonly entries: () => IterableIterator<readonly [K, K]>;

  // Conversion
  readonly toArray: () => readonly K[];
  readonly toRawSet: () => ReadonlySet<KM>;
}

export type ISetMapped<K, KM extends SetKeyType> = Iterable<K> &
  Readonly<ISetMappedInterface<K, KM>>;

export const ISetMapped = {
  new: <K, KM extends SetKeyType>(
    iterable: Iterable<K>,
    toKey: (a: K) => KM,
    fromKey: (k: KM) => K,
  ): ISetMapped<K, KM> => new ISetMappedClass<K, KM>(iterable, toKey, fromKey),

  equal: <K, KM extends SetKeyType>(
    a: ISetMapped<K, KM>,
    b: ISetMapped<K, KM>,
  ): boolean => {
    if (a.size !== b.size) return false;

    return a.every((e) => b.has(e));
  },

  diff: <K, KM extends SetKeyType>(
    oldSet: ISetMapped<K, KM>,
    newSet: ISetMapped<K, KM>,
  ): Record<'added' | 'deleted', ISetMapped<K, KM>> => ({
    deleted: oldSet.subtract(newSet),
    added: newSet.subtract(oldSet),
  }),

  intersection: <K, KM extends SetKeyType>(
    a: ISetMapped<K, KM>,
    b: ISetMapped<K, KM>,
  ): ISetMapped<K, KM> => a.intersect(b),

  union: <K, KM extends SetKeyType>(
    a: ISetMapped<K, KM>,
    b: ISetMapped<K, KM>,
  ): ISetMapped<K, KM> => a.union(b),
} as const;

class ISetMappedClass<K, KM extends SetKeyType>
  implements ISetMapped<K, KM>, Iterable<K>
{
  readonly #set: ReadonlySet<KM>;
  readonly #toKey: (a: K) => KM;
  readonly #fromKey: (k: KM) => K;

  constructor(
    iterable: Iterable<K>,
    toKey: (a: K) => KM,
    fromKey: (k: KM) => K,
  ) {
    // eslint-disable-next-line no-restricted-globals
    this.#set = new Set(Array.from(iterable, toKey));
    this.#toKey = toKey;
    this.#fromKey = fromKey;
  }

  get size(): NumberType.ArraySize {
    return this.#set.size;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  has(key: K): boolean {
    return this.#set.has(this.#toKey(key));
  }

  every<L extends K>(
    predicate: (key: K) => key is L,
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
      this.#fromKey,
    );
  }

  delete(key: K): ISetMapped<K, KM> {
    if (!this.has(key)) {
      console.warn(`ISetMapped.delete: key not found: ${this.#toKey(key)}`);
      return this;
    }
    const keyMapped = this.#toKey(key);

    return ISetMapped.new(
      Array.from(this.#set)
        .filter((k) => !Object.is(k, keyMapped))
        .map(this.#fromKey),
      this.#toKey,
      this.#fromKey,
    );
  }

  withMutations(
    actions: readonly Readonly<
      | {
          type: 'add';
          key: K;
        }
      | {
          type: 'delete';
          key: K;
        }
    >[],
  ): ISetMapped<K, KM> {
    // eslint-disable-next-line no-restricted-globals
    const mut_result = new Set<KM>(this.#set);

    for (const action of actions) {
      const key = this.#toKey(action.key);

      switch (action.type) {
        case 'delete':
          mut_result.delete(key);
          break;

        case 'add':
          mut_result.add(key);
          break;
      }
    }

    return ISetMapped.new<K, KM>(
      Array.from(mut_result, this.#fromKey),
      this.#toKey,
      this.#fromKey,
    );
  }

  map(mapFn: (key: K) => K): ISetMapped<K, KM> {
    return ISetMapped.new(
      this.toArray().map(mapFn),
      this.#toKey,
      this.#fromKey,
    );
  }

  filter(predicate: (key: K) => boolean): ISetMapped<K, KM> {
    return ISetMapped.new(
      this.toArray().filter(predicate),
      this.#toKey,
      this.#fromKey,
    );
  }

  filterNot(predicate: (key: K) => boolean): ISetMapped<K, KM> {
    return ISetMapped.new(
      this.toArray().filter((k) => !predicate(k)),
      this.#toKey,
      this.#fromKey,
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
    return set.every((k) => this.has(k));
  }

  subtract(set: ISetMapped<K, KM>): ISetMapped<K, KM> {
    return ISetMapped.new(
      this.toArray().filter((k) => !set.has(k)),
      this.#toKey,
      this.#fromKey,
    );
  }

  intersect(set: ISetMapped<K, KM>): ISetMapped<K, KM> {
    return ISetMapped.new(
      this.toArray().filter((k) => set.has(k)),
      this.#toKey,
      this.#fromKey,
    );
  }

  union(set: ISetMapped<K, KM>): ISetMapped<K, KM> {
    return ISetMapped.new(
      [...this.values(), ...set.values()],
      this.#toKey,
      this.#fromKey,
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

      yield [a, a] as const;
    }
  }

  toArray(): readonly K[] {
    return Array.from(this.values());
  }

  toRawSet(): ReadonlySet<KM> {
    return this.#set;
  }
}
