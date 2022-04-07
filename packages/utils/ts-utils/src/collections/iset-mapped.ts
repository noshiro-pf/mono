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
  private readonly _set: ReadonlySet<KM>;
  private readonly _toKey: (a: K) => KM;
  private readonly _fromKey: (k: KM) => K;

  constructor(
    iterable: Iterable<K>,
    toKey: (a: K) => KM,
    fromKey: (k: KM) => K
  ) {
    this._set = new Set(Array.from(iterable, toKey));
    this._toKey = toKey;
    this._fromKey = fromKey;
  }

  get size(): number {
    return this._set.size;
  }

  get isEmpty(): boolean {
    return this.size === 0;
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

  add(key: K): ISetMapped<K, KM> {
    if (this.has(key)) return this;

    return ISetMapped.new(
      [...this._set, this._toKey(key)].map(this._fromKey),
      this._toKey,
      this._fromKey
    );
  }

  delete(key: K): ISetMapped<K, KM> {
    if (!this.has(key)) return this;
    const keyMapped = this._toKey(key);

    return ISetMapped.new(
      Array.from(this._set)
        .filter((k) => !Object.is(k, keyMapped))
        .map(this._fromKey),
      this._toKey,
      this._fromKey
    );
  }

  withMutations(
    actions: readonly Readonly<
      { type: 'add'; key: K } | { type: 'delete'; key: K }
    >[]
  ): ISetMapped<K, KM> {
    const result = new Set<KM>(this._set);

    for (const action of actions) {
      const key = this._toKey(action.key);

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
      Array.from(result, this._fromKey),
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

  filter(predicate: (key: K) => boolean): ISetMapped<K, KM> {
    return ISetMapped.new(
      this.toArray().filter(predicate),
      this._toKey,
      this._fromKey
    );
  }

  filterNot(predicate: (key: K) => boolean): ISetMapped<K, KM> {
    return ISetMapped.new(
      this.toArray().filter((k) => !predicate(k)),
      this._toKey,
      this._fromKey
    );
  }

  forEach(callbackfn: (key: K) => void): void {
    for (const km of this._set) {
      callbackfn(this._fromKey(km));
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
    return Array.from(this.values());
  }

  toRawSet(): ReadonlySet<KM> {
    return this._set;
  }
}
