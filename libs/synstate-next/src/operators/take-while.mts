import {
  DerivedClass,
  noValue,
  toNode,
  view,
  type DropInitialValueOperator,
  type KeepInitialValueOperator,
  type Observable,
  type ObservableClass,
} from '../core/index.mjs';

/**
 * Passes the values of the source while `predicate` holds for them; from the
 * first value it fails for, passes nothing, keeping the last value passed. With
 * `inclusive`, it passes that first value too, and is settled when a subscriber
 * receives it, so the subscriber can tell the last value by reading `settled`;
 * it then holds a value whenever the source does.
 */
export function takeWhile<A>(
  predicate: (value: A) => boolean,
  options: TakeWhileOptions & Readonly<{ inclusive: true }>,
): KeepInitialValueOperator<A, A>;

/**
 * Passes the values of the source while `predicate` holds for them; from the
 * first value it fails for, passes nothing, keeping the last value passed. With
 * `inclusive`, it passes that first value too, and is settled when a subscriber
 * receives it, so the subscriber can tell the last value by reading `settled`;
 * it then holds a value whenever the source does.
 */
export function takeWhile<A>(
  predicate: (value: A) => boolean,
  options?: TakeWhileOptions,
): DropInitialValueOperator<A, A>;

// Overloads rather than a type parameter for `inclusive`: with one, a caller
// who writes `takeWhile<number>(…)` fixes it at its default and cannot pass
// `{ inclusive: true }`. Both overloads carry the JSDoc, since an editor shows
// the one a call resolves to, and most calls resolve to the second.
export function takeWhile<A>(
  predicate: (value: A) => boolean,
  options?: TakeWhileOptions,
): KeepInitialValueOperator<A, A> | DropInitialValueOperator<A, A> {
  return (source: Observable<A>): Observable<A> =>
    view(
      new TakeWhileClass(
        toNode(source),
        predicate,
        options?.inclusive ?? false,
      ),
    );
}

/**
 * Drops the values of the source while `predicate` holds for them; from the
 * first value it fails for, passes every value.
 */
export const skipWhile =
  <A,>(predicate: (value: A) => boolean): DropInitialValueOperator<A, A> =>
  (source) =>
    view(new SkipWhileClass(toNode(source), predicate));

export type TakeWhileOptions = Readonly<{
  /** Pass the first value `predicate` fails for, and then stop. */
  inclusive?: boolean;
}>;

class TakeWhileClass<A> extends DerivedClass<A> {
  readonly #parent: ObservableClass<A>;

  readonly #predicate: (value: A) => boolean;

  /** Whether it passes the value that ends it. */
  readonly #inclusive: boolean;

  constructor(
    parent: ObservableClass<A>,
    predicate: (value: A) => boolean,
    inclusive: boolean,
  ) {
    const v = parent.current;

    const ends = v !== noValue && !predicate(v);

    super([parent], ends && !inclusive ? noValue : v);

    this.#parent = parent;

    this.#predicate = predicate;

    this.#inclusive = inclusive;

    if (ends) {
      this.detach();
    }
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    // Not called once done: the node has detached.
    if (v === noValue) {
      return false;
    }

    if (!this.#predicate(v)) {
      this.detach();

      if (!this.#inclusive) {
        return false;
      }
    }

    this.current = v;

    return true;
  }
}

class SkipWhileClass<A> extends DerivedClass<A> {
  readonly #parent: ObservableClass<A>;

  readonly #predicate: (value: A) => boolean;

  #mut_passing: boolean;

  constructor(parent: ObservableClass<A>, predicate: (value: A) => boolean) {
    const v = parent.current;

    const passing = v !== noValue && !predicate(v);

    super([parent], passing ? v : noValue);

    this.#parent = parent;

    this.#predicate = predicate;

    this.#mut_passing = passing;
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    if (v === noValue) {
      return false;
    }

    if (!this.#mut_passing) {
      if (this.#predicate(v)) {
        return false;
      }

      this.#mut_passing = true;
    }

    this.current = v;

    return true;
  }
}
