import {
  DerivedClass,
  currentEpoch,
  noValue,
  toNode,
  view,
  type InitializedObservable,
  type Observable,
  type ObservableClass,
} from '../core/index.mjs';

/** The values of a tuple of observables. */
export type ValuesOf<P extends readonly Observable<unknown>[]> = Readonly<{
  [K in keyof P]: P[K] extends Observable<infer V> ? V : never;
}>;

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
  options?: Readonly<{ equals?: (a: B, b: B) => boolean }>,
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

/** The latest values of `parents` as a tuple, on every update that reaches it. */
export const combine = <const P extends readonly Observable<unknown>[]>(
  parents: P,
): DerivedOf<P, ValuesOf<P>> =>
  derive(parents, (...values) => values, {
    equals: () => false,
  });

/**
 * Emits the value of whichever parent emitted in this update (the first of
 * them, if several did). Holds no value until one emits.
 */
export const merge = <const P extends readonly Observable<unknown>[]>(
  parents: P,
): Observable<ValuesOf<P>[number]> => view(new MergeClass(parents.map(toNode)));

class DeriveClass<B> extends DerivedClass<B> {
  readonly #fn: (...values: readonly unknown[]) => B;

  readonly #equals: (a: B, b: B) => boolean;

  constructor(
    parents: readonly ObservableClass<unknown>[],
    fn: (...values: readonly unknown[]) => B,
    equals: (a: B, b: B) => boolean,
  ) {
    const initial = readAll(parents);

    super(parents, initial === undefined ? noValue : fn(...initial));

    this.#fn = fn;

    this.#equals = equals;
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
        const values = readAll(ps);

        if (values === undefined) {
          return false;
        }

        mut_next = this.#fn(...values);
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

/** The parents' values, or `undefined` while one of them holds none. */
const readAll = (
  parents: readonly ObservableClass<unknown>[],
): readonly unknown[] | undefined => {
  const mut_values: unknown[] = [];

  for (const parent of parents) {
    const v = parent.current;

    if (v === noValue) {
      return undefined;
    }

    mut_values.push(v);
  }

  return mut_values;
};

class MergeClass extends DerivedClass<unknown> {
  constructor(parents: readonly ObservableClass<unknown>[]) {
    super(parents, noValue);
  }

  override recompute(): boolean {
    const epoch = currentEpoch();

    for (const parent of this.parents) {
      if (parent.changedAt === epoch && parent.current !== noValue) {
        this.current = parent.current;

        return true;
      }
    }

    return false;
  }
}
