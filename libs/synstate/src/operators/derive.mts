import {
  DerivedClass,
  latestHolder,
  noValue,
  toNode,
  view,
  type InitializedObservable,
  type Observable,
  type ObservableClass,
  type ObservableValue,
} from '../core/index.mjs';

/**
 * The values of a tuple or an array of observables, in the same shape. A mapped
 * type keeps that shape only over a tuple or an array itself. An array narrowed
 * by `Arr.isNonEmpty` is an intersection, over which it maps the array's other
 * members too (`length`, `map`) and gives an object whose `length` is `never`;
 * that one is read element by element instead.
 */
export type ValuesOf<P extends readonly Observable<unknown>[]> =
  MappedValuesOf<P> extends Readonly<{ length: never }>
    ? LeadingValuesOf<P>
    : MappedValuesOf<P>;

/** Holds a value when every parent always holds one. */
export type DerivedOf<
  P extends readonly Observable<unknown>[],
  B,
> = P extends readonly InitializedObservable<unknown>[]
  ? InitializedObservable<B>
  : Observable<B>;

/**
 * Computes `fn` from the values of `parents`, once per update however many of
 * them changed, and emits the result unless it equals the one held. Holds no
 * value until every parent holds one.
 */
export const derive = <const P extends readonly Observable<unknown>[], B>(
  parents: P,
  fn: (...values: ValuesOf<P>) => B,
  options?: Readonly<{ equals?: (current: B, next: B) => boolean }>,
): DerivedOf<P, B> =>
  // The type follows the parents'; the class is the same either way.
  view(
    new DeriveClass(
      parents.map(toNode),
      // `fn` takes the values in the parents' order, as `recompute` passes
      // them; the class cannot carry the tuple type.
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      fn as (...values: readonly unknown[]) => B,
      options?.equals ?? Object.is,
    ),
  );

/**
 * Holds a value when some parent always holds one: an element of the tuple's
 * leading part. An element typed as a union may be one that holds none, and an
 * array of any length may be empty.
 */
export type MergedOf<P extends readonly Observable<unknown>[], B> =
  SomeLeadingInitialized<P> extends true
    ? InitializedObservable<B>
    : Observable<B>;

/**
 * @internal A step of `MergedOf`, which is what a consumer spells.
 *
 * Whether an element of the leading part of `P` is an `InitializedObservable`.
 * `H` is inferred, not a type parameter, so the check does not distribute over
 * a union element.
 */
type SomeLeadingInitialized<P extends readonly unknown[]> = P extends readonly [
  infer H,
  ...infer R,
]
  ? [H] extends [InitializedObservable<unknown>]
    ? true
    : SomeLeadingInitialized<R>
  : false;

/**
 * Emits the value of whichever parent emitted in this update (the first of
 * them, if several did). Starts from the value of the parent whose value was
 * given last, by the same rule: of values given in one update, the first
 * parent's. Holds no value while no parent holds one.
 */
export const merge = <const P extends readonly Observable<unknown>[]>(
  parents: P,
): MergedOf<P, ValuesOf<P>[number]> =>
  // The type follows the parents'; the class is the same either way.
  view(new MergeClass(parents.map(toNode)));

/**
 * @internal A step of `ValuesOf`, which is what a consumer spells.
 *
 * The values of `P` by a mapped type over it.
 */
type MappedValuesOf<P extends readonly Observable<unknown>[]> = Readonly<{
  [K in keyof P]: P[K] extends Observable<infer V> ? V : never;
}>;

/**
 * @internal A step of `ValuesOf`, which is what a consumer spells.
 *
 * The values of the leading elements of `P`, one at a time, then, if its length
 * is `number`, the values of any element after them as a rest. `Skip` counts the
 * elements read: inferring the rest of an intersection as `...infer R` gives
 * `unknown[]`.
 */
type LeadingValuesOf<
  P extends readonly Observable<unknown>[],
  Skip extends readonly unknown[] = readonly [],
  Acc extends readonly unknown[] = readonly [],
> = P extends readonly [
  ...Skip,
  infer H extends Observable<unknown>,
  ...unknown[],
]
  ? LeadingValuesOf<
      P,
      readonly [...Skip, unknown],
      readonly [...Acc, ObservableValue<H>]
    >
  : number extends P['length']
    ? readonly [...Acc, ...ObservableValue<P[number]>[]]
    : Acc;

class DeriveClass<B> extends DerivedClass<B> {
  readonly #fn: (...values: readonly unknown[]) => B;

  readonly #equals: (current: B, next: B) => boolean;

  /**
   * The parents' values, rewritten by every recompute, for three or more
   * parents; `undefined` for fewer: `recompute` reads one and two without it,
   * and a derive of no parents never recomputes. `fn` receives them spread, as arguments of
   * its own, so nothing it is given changes later and this node builds no array
   * per update (a rest parameter of `fn` still builds its own).
   */
  readonly #mut_values: unknown[] | undefined;

  constructor(
    parents: readonly ObservableClass<unknown>[],
    fn: (...values: readonly unknown[]) => B,
    equals: (current: B, next: B) => boolean,
  ) {
    // Read here, before `super`, so that a `fn` that throws leaves no node
    // among the parents' children. A parent with no value leaves `noValue` in
    // its place, which every recompute overwrites before `fn` reads it.
    const mut_values = parents.map((parent): unknown => parent.current);

    super(parents, mut_values.includes(noValue) ? noValue : fn(...mut_values));

    this.#fn = fn;

    this.#equals = equals;

    // Kept only for three or more parents; see the field.
    this.#mut_values = parents.length > 2 ? mut_values : undefined;
  }

  override recompute(): boolean {
    const ps = this.parents;

    let mut_next: B;

    // One and two parents are unrolled: spreading an array allocates one.
    switch (ps.length) {
      case 1: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const a = ps[0]!.current;

        if (a === noValue) {
          return false;
        }

        mut_next = this.#fn(a);

        break;
      }

      case 2: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const a = ps[0]!.current;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const b = ps[1]!.current;

        if (a === noValue || b === noValue) {
          return false;
        }

        mut_next = this.#fn(a, b);

        break;
      }

      default: {
        const mut_values = this.#mut_values;

        // Never `undefined` here; see the field.
        if (mut_values === undefined) {
          return false;
        }

        const { length } = ps;

        // Indexed: `entries()` builds an iterator on every recompute, and a
        // `for…of` with a counter measured slower still.
        // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
        for (let mut_i = 0; mut_i < length; mut_i += 1) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const v = ps[mut_i]!.current;

          if (v === noValue) {
            return false;
          }

          mut_values[mut_i] = v;
        }

        mut_next = this.#fn(...mut_values);
      }
    }

    const held = this.current;

    if (held !== noValue && this.#equals(held, mut_next)) {
      return false;
    }

    this.current = mut_next;

    return true;
  }
}

/** The value `merge` starts from: not `??`, since a parent may hold `undefined`. */
const startingValue = (
  parents: readonly ObservableClass<unknown>[],
): unknown => {
  const holder = latestHolder(parents);

  return holder === undefined ? noValue : holder.current;
};

class MergeClass extends DerivedClass<unknown> {
  constructor(parents: readonly ObservableClass<unknown>[]) {
    super(parents, startingValue(parents));
  }

  override recompute(): boolean {
    for (const parent of this.parents) {
      if (this.emittedNow(parent) && parent.current !== noValue) {
        this.current = parent.current;

        return true;
      }
    }

    return false;
  }
}
