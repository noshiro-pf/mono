import type { StrictOmit } from 'ts-type-forge';

/** Stops a subscription. */
export type Unsubscribe = () => void;

/**
 * What an operator does to the initial value: `keep` has one when its source
 * has one (`map`), `drop` may have none (`filter`), `provide` always gives one
 * (`scan`, `withInitialValue`).
 */
export type InitKind = 'drop' | 'keep' | 'provide';

declare const initKindTag: unique symbol;

declare const initializedTag: unique symbol;

/**
 * Marks an observable that always holds a value, in the type only. `pipe`'s
 * overloads take it as their `this`, rather than `InitializedObservable<A>`, so
 * that `Observable<A>` stays covariant in `A`.
 */
export type Initialized = Readonly<{ [initializedTag]: true }>;

/**
 * A function from one observable to another. `K` exists only in the type, so
 * that `pipe` can tell whether the result has a value.
 */
export type Operator<A, B, K extends InitKind = InitKind> = ((
  source: Observable<A>,
) => Observable<B>) &
  Readonly<{ [initKindTag]?: K }>;

/**
 * A value that changes over time. It may have no value yet (an event source, a
 * `filter` that has passed nothing); see {@link InitializedObservable}.
 */
export type Observable<A> = Readonly<{
  /** Whether it holds a value. */
  hasValue: boolean;
  /** The value it holds, or `undefined` when it holds none. */
  getSnapshot: () => A | undefined;
  /**
   * Calls `fn` with the current value, if any, and then with every value once
   * every value of its update is up to date. Belongs to the current owner.
   */
  subscribe: (fn: (value: A) => void) => Unsubscribe;
  pipe: Pipe<A>;
  /** Disposes it: it leaves the graph and never emits again. */
  dispose: () => void;
}>;

/**
 * An observable that always holds a value. `getSnapshot` is replaced, not
 * intersected, so that it has the one signature that returns `A`: an
 * intersection would also keep `() => A | undefined`, which inference against
 * `Observable<A>` and `ReturnType` would read.
 */
export type InitializedObservable<A> = StrictOmit<
  Observable<A>,
  'getSnapshot'
> &
  Initialized &
  Readonly<{
    /** The value it holds. */
    value: A;
    /** The value it holds, as `value` reads it. */
    getSnapshot: () => A;
  }>;

type Out<B, I extends boolean> = I extends true
  ? InitializedObservable<B>
  : Observable<B>;

/**
 * `pipe(op)`: applies one operator; chain calls to apply more
 * (`a.pipe(map(f)).pipe(filter(p))`). The result holds a value when the source
 * does and the operator does not drop it, or when the operator provides one.
 */
export type Pipe<A> = {
  <B, K extends InitKind>(
    this: Initialized,
    operator: Operator<A, B, K>,
  ): Out<B, K extends 'drop' ? false : true>;

  <B, K extends InitKind>(
    operator: Operator<A, B, K>,
  ): Out<B, K extends 'provide' ? true : false>;
};
