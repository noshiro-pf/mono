/** Stops a subscription. */
export type Unsubscribe = () => void;

/**
 * What an operator does to the initial value: `keep` has one when its source
 * has one (`map`), `drop` may have none (`filter`), `with` always has one
 * (`scan`, `withInitialValue`).
 */
export type InitKind = 'drop' | 'keep' | 'with';

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
  peek: () => A | undefined;
  /**
   * Calls `fn` with the current value, if any, and then with every value after
   * an update has settled. Belongs to the current owner.
   */
  subscribe: (fn: (value: A) => void) => Unsubscribe;
  pipe: Pipe<A>;
  /** Disposes it: it leaves the graph and never emits again. */
  dispose: () => void;
}>;

/** An observable that always holds a value. */
export type InitializedObservable<A> = Observable<A> &
  Initialized &
  Readonly<{
    /** The value it holds. */
    value: A;
  }>;

type Out<B, I extends boolean> = I extends true
  ? InitializedObservable<B>
  : Observable<B>;

type After<I extends boolean, K extends InitKind> = K extends 'with'
  ? true
  : K extends 'drop'
    ? false
    : I;

/**
 * `pipe(op1, op2, …)`: applies the operators in order. The result holds a value
 * when the source does and no operator drops it, or when an operator provides
 * one.
 */
export type Pipe<A> = {
  <B, K1 extends InitKind>(
    this: Initialized,
    o1: Operator<A, B, K1>,
  ): Out<B, After<true, K1>>;

  <B, K1 extends InitKind>(o1: Operator<A, B, K1>): Out<B, After<false, K1>>;

  <B, C, K1 extends InitKind, K2 extends InitKind>(
    this: Initialized,
    o1: Operator<A, B, K1>,
    o2: Operator<B, C, K2>,
  ): Out<C, After<After<true, K1>, K2>>;

  <B, C, K1 extends InitKind, K2 extends InitKind>(
    o1: Operator<A, B, K1>,
    o2: Operator<B, C, K2>,
  ): Out<C, After<After<false, K1>, K2>>;

  <B, C, D, K1 extends InitKind, K2 extends InitKind, K3 extends InitKind>(
    this: Initialized,
    o1: Operator<A, B, K1>,
    o2: Operator<B, C, K2>,
    o3: Operator<C, D, K3>,
  ): Out<D, After<After<After<true, K1>, K2>, K3>>;

  <B, C, D, K1 extends InitKind, K2 extends InitKind, K3 extends InitKind>(
    o1: Operator<A, B, K1>,
    o2: Operator<B, C, K2>,
    o3: Operator<C, D, K3>,
  ): Out<D, After<After<After<false, K1>, K2>, K3>>;

  <
    B,
    C,
    D,
    E,
    K1 extends InitKind,
    K2 extends InitKind,
    K3 extends InitKind,
    K4 extends InitKind,
  >(
    this: Initialized,
    o1: Operator<A, B, K1>,
    o2: Operator<B, C, K2>,
    o3: Operator<C, D, K3>,
    o4: Operator<D, E, K4>,
  ): Out<E, After<After<After<After<true, K1>, K2>, K3>, K4>>;

  <
    B,
    C,
    D,
    E,
    K1 extends InitKind,
    K2 extends InitKind,
    K3 extends InitKind,
    K4 extends InitKind,
  >(
    o1: Operator<A, B, K1>,
    o2: Operator<B, C, K2>,
    o3: Operator<C, D, K3>,
    o4: Operator<D, E, K4>,
  ): Out<E, After<After<After<After<false, K1>, K2>, K3>, K4>>;
};
