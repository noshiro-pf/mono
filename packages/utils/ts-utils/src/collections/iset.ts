import { assertType } from '../assert-type';
import { MutableSet } from '../others';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ISetInterface<K> {
  new (iterable: Iterable<K>): void;

  // Getting information
  size: number;
  isEmpty: boolean;
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

  // eslint-disable-next-line @typescript-eslint/sort-type-constituents
  filter: (<K2 extends K>(predicate: (key: K) => key is K2) => ISet<K2>) &
    ((predicate: (key: K) => boolean) => ISet<K>);

  filterNot: (predicate: (key: K) => boolean) => ISet<K>;

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
  toRawSet: () => ReadonlySet<K>;
}

export type ISet<K> = Iterable<K> & Readonly<ISetInterface<K>>;

// eslint-disable-next-line no-restricted-globals
const ArrayFrom = Array.from;

export const ISet = {
  new: <K>(iterable: Iterable<K>): ISet<K> => new ISetClass<K>(iterable),

  equal: <K>(a: ISet<K>, b: ISet<K>): boolean => {
    if (a.size !== b.size) return false;

    return a.every((e) => b.has(e));
  },

  diff: <K>(
    oldSet: ISet<K>,
    newSet: ISet<K>
  ): Record<'added' | 'deleted', ISet<K>> => ({
    deleted: oldSet.subtract(newSet),
    added: newSet.subtract(oldSet),
  }),

  intersection: <K>(a: ISet<K>, b: ISet<K>): ISet<K> => a.intersect(b),

  union: <K1, K2>(a: ISet<K1>, b: ISet<K2>): ISet<K1 | K2> => a.union(b),
} as const;

class ISetClass<K> implements ISet<K>, Iterable<K> {
  readonly #set: ReadonlySet<K>;

  constructor(iterable: Iterable<K>) {
    this.#set = new MutableSet(iterable);
  }

  get size(): number {
    return this.#set.size;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  has(key: K): boolean {
    return this.#set.has(key);
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

    return ISet.new([...this.#set, key]);
  }

  delete(key: K): ISet<K> {
    if (!this.has(key)) return this;

    return ISet.new(ArrayFrom(this.#set).filter((k) => !Object.is(k, key)));
  }

  withMutations(
    actions: readonly Readonly<
      { type: 'add'; key: K } | { type: 'delete'; key: K }
    >[]
  ): ISet<K> {
    const mut_result = new MutableSet<K>(this.#set);

    for (const action of actions) {
      switch (action.type) {
        case 'delete':
          mut_result.delete(action.key);
          break;
        case 'add':
          mut_result.add(action.key);
          break;
      }
    }

    return ISet.new(mut_result);
  }

  map<K2>(mapFn: (key: K) => K2): ISet<K2> {
    return ISet.new(this.toArray().map(mapFn));
  }

  filter<K2 extends K>(predicate: (key: K) => key is K2): ISet<K2>;

  filter(predicate: (key: K) => boolean): ISet<K>;

  filter(predicate: (key: K) => boolean): ISet<K> {
    return ISet.new(this.toArray().filter(predicate));
  }

  filterNot(predicate: (key: K) => boolean): ISet<K> {
    return ISet.new(this.toArray().filter((e) => !predicate(e)));
  }

  forEach(callbackfn: (key: K) => void): void {
    for (const v of this.#set.values()) {
      callbackfn(v);
    }
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
    return this.#set[Symbol.iterator]();
  }

  keys(): IterableIterator<K> {
    return this.#set.keys();
  }

  values(): IterableIterator<K> {
    return this.#set.values();
  }

  entries(): IterableIterator<readonly [K, K]> {
    return this.#set.entries();
  }

  toArray(): readonly K[] {
    return ArrayFrom(this.values());
  }

  toRawSet(): ReadonlySet<K> {
    return this.#set;
  }
}

{
  const s = ISet.new([1, 2, 3] as const);
  const r = s.filter((x): x is 1 => x === 1);

  assertType<TypeEq<typeof r, ISet<1>>>();
}
