import type { uint32 } from '../types';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ISetInterface<K> {
  new (iterable: Iterable<K>): void;

  // Getting information
  size: uint32;
  has: (key: K) => boolean;

  // Reducing a value
  every: ((predicate: (key: K) => boolean) => boolean) &
    (<L extends K>(predicate: (key: K) => key is L) => this is ISet<L>);
  some: (predicate: (key: K) => boolean) => boolean;

  // Mutation
  add: (key: K) => ISet<K>;
  delete: (key: K) => ISet<K>;
  withMutations: (
    actions: readonly Readonly<
      { type: 'add'; key: K } | { type: 'delete'; key: K }
    >[]
  ) => ISet<K>;

  // Sequence algorithms
  map: <K2>(mapFn: (key: K) => K2) => ISet<K2>;

  // Set operations
  isSubsetOf: (set: ISet<K>) => boolean;
  isSupersetOf: (set: ISet<K>) => boolean;
  subtract: (set: ISet<K>) => ISet<K>;
  intersect: (set: ISet<K>) => ISet<K>;
  union: <K2>(set: ISet<K2>) => ISet<K | K2>;

  // Side effects
  forEach: (callbackfn: (key: K) => void) => void;

  // Iterators
  keys: () => IterableIterator<K>;
  values: () => IterableIterator<K>;
  entries: () => IterableIterator<readonly [K, K]>;

  // Conversion
  toArray: () => readonly K[];
}

export type ISet<K> = Iterable<K> & Readonly<ISetInterface<K>>;

export const ISet = {
  new: <K>(iterable: Iterable<K>): ISet<K> => new ISetClass<K>(iterable),
  equal: <K>(a: ISet<K>, b: ISet<K>): boolean => {
    if (a.size !== b.size) return false;
    return a.every((e) => b.has(e));
  },
} as const;

class ISetClass<K> implements ISet<K>, Iterable<K> {
  private readonly _set: ReadonlySet<K>;

  constructor(iterable: Iterable<K>) {
    this._set = new Set(iterable);
  }

  get size(): uint32 {
    return this._set.size as uint32;
  }

  has(key: K): boolean {
    return this._set.has(key);
  }

  every<L extends K>(predicate: (key: K) => key is L): this is ISet<L>;
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

  add(key: K): ISet<K> {
    if (this.has(key)) return this;
    return ISet.new([...this._set, key]);
  }

  delete(key: K): ISet<K> {
    if (!this.has(key)) return this;
    return ISet.new([...this._set].filter((k) => !Object.is(k, key)));
  }

  withMutations(
    actions: readonly Readonly<
      { type: 'add'; key: K } | { type: 'delete'; key: K }
    >[]
  ): ISet<K> {
    const result = new Set<K>(this._set);
    for (const action of actions) {
      switch (action.type) {
        case 'delete':
          result.delete(action.key);
          break;
        case 'add':
          result.add(action.key);
          break;
      }
    }
    return ISet.new(result);
  }

  map<K2>(mapFn: (key: K) => K2): ISet<K2> {
    return ISet.new(this.toArray().map(mapFn));
  }

  forEach(callbackfn: (key: K) => void): void {
    this._set.forEach(callbackfn);
  }

  isSubsetOf(set: ISet<K>): boolean {
    return this.every((k) => set.has(k));
  }

  isSupersetOf(set: ISet<K>): boolean {
    return set.every((k) => this.has(k));
  }

  subtract(set: ISet<K>): ISet<K> {
    return ISet.new(this.toArray().filter((k) => !set.has(k)));
  }

  intersect(set: ISet<K>): ISet<K> {
    return ISet.new(this.toArray().filter((k) => set.has(k)));
  }

  union<K2>(set: ISet<K2>): ISet<K | K2> {
    return ISet.new([...this, ...set]);
  }

  [Symbol.iterator](): Iterator<K> {
    return this._set[Symbol.iterator]();
  }

  keys(): IterableIterator<K> {
    return this._set.keys();
  }

  values(): IterableIterator<K> {
    return this._set.values();
  }

  entries(): IterableIterator<readonly [K, K]> {
    return this._set.entries();
  }

  toArray(): readonly K[] {
    return [...this.values()];
  }
}
