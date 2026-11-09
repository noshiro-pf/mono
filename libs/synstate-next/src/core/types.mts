import type { StrictOmit } from 'ts-type-forge';

/** Stops a subscription. */
export type Unsubscribe = () => void;

declare const initializedTag: unique symbol;

/**
 * Marks an observable that always holds a value, in the type only. `pipe`'s
 * overloads take it as their `this`, rather than `InitializedObservable<A>`, so
 * that `Observable<A>` stays covariant in `A`.
 */
export type Initialized = Readonly<{ [initializedTag]: true }>;

/**
 * An operator whose result always holds a value (`scan`, `withInitialValue`).
 * Its return type says so, so an implementation that returns an `Observable`
 * that may hold none does not type-check without a cast.
 */
export type ProvideInitialValueOperator<A, B> = (
  source: Observable<A>,
) => InitializedObservable<B>;

/**
 * An operator whose result holds a value when its source does (`map`,
 * `debounce`). Its type takes an `InitializedObservable`; `pipe` applies it to
 * any observable, and gives an `Observable` for one that may hold none.
 */
export type KeepInitialValueOperator<A, B> = (
  source: InitializedObservable<A>,
) => InitializedObservable<B>;

/** An operator whose result may hold no value (`filter`, `switchMap`). */
export type DropInitialValueOperator<A, B> = (
  source: Observable<A>,
) => Observable<B>;

/**
 * Any operator: what `pipe`'s implementation takes. The package does not
 * export it, because a value of this type cannot be called on an `Observable`
 * and `pipe` cannot tell from it whether the result holds a value; `pipe`'s
 * overloads name the three types instead.
 */
export type Operator<A, B> =
  | DropInitialValueOperator<A, B>
  | KeepInitialValueOperator<A, B>
  | ProvideInitialValueOperator<A, B>;

/**
 * A value that changes over time. It may have no value yet (an event source, a
 * `filter` that has passed nothing); see {@link InitializedObservable}.
 *
 * Its functions are methods, called on the observable (`o.dispose()`): passed
 * on their own they lose it and throw. Each declares a `this`, so TypeScript
 * rejects calling one taken off it (`const { dispose } = o`) and passing one
 * where the callee types the function's `this` as something else (`subscribe`
 * and `onCleanup` as `unknown`, an event handler of synstate-dom-next as the
 * element). Wrap one to pass it elsewhere:
 * `() => { o.dispose(); }`. The `this` is `Observable<unknown>`, which does not
 * name `A`, so that `Observable<A>` stays covariant in `A`.
 */
export type Observable<A> = Readonly<{
  /** Whether it holds a value. */
  hasValue: boolean;
  /**
   * The value it holds, or `undefined` when it holds none. `NoInfer`, because
   * inferring `A` from `A | undefined` against `number | undefined` gives
   * `number`, which, where an operator's `source` is inferred (a parameter),
   * would win over the `number | undefined` the other members give.
   */
  getSnapshot: (this: Observable<unknown>) => NoInfer<A> | undefined;
  /**
   * Whether it will never emit again: disposed, a source that is done (a
   * `timer` that fired, a promise that settled), or an operator that is done (a
   * `take` that passed its last value). Asked, not announced: nothing is called
   * when it turns true. A `take` is settled when its subscriber receives its
   * last value; a `takeWhile` once a value fails, which it does not pass unless
   * `inclusive`, or once its source is settled. Below an operator that can drop
   * the last value (`filter`) or emit it later (`debounce`, `switchMap`), the
   * last value and `settled` can come apart. A state is settled only once
   * disposed.
   */
  settled: boolean;
  /**
   * Calls `fn` with the current value, if any, and then with every value once
   * every value of its update is up to date. Belongs to the current owner.
   */
  subscribe: (
    this: Observable<unknown>,
    fn: (this: unknown, value: A) => void,
  ) => Unsubscribe;
  pipe: Pipe<A>;
  /** Disposes it: it leaves the graph and never emits again. */
  dispose: (this: Observable<unknown>) => void;
}>;

/**
 * The type of the values `O` holds and emits: `ObservableValue<typeof count>`
 * names it where only the observable is at hand, as in a hook that returns its
 * value. Of a union of observables, the union of their values. `O` must be an
 * observable, so that `Observable<number> | undefined` is an error rather than
 * a type whose `undefined` is dropped unseen. It does not distribute, so
 * `never` gives `unknown`, as an element of `ValuesOf` does.
 */
export type ObservableValue<O extends Observable<unknown>> = [O] extends [
  Observable<infer A>,
]
  ? A
  : never;

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
    getSnapshot: (this: Observable<unknown>) => A;
  }>;

/**
 * `pipe(op)`: applies one operator; chain calls to apply more
 * (`a.pipe(map(f)).pipe(filter(p))`). The operator's type decides whether the
 * result holds a value: a `ProvideInitialValueOperator` always gives one, a
 * `KeepInitialValueOperator` keeps one only where the source holds one, and a
 * `DropInitialValueOperator` never promises one.
 */
export type Pipe<A> = {
  // A `ProvideInitialValueOperator` is assignable to the other two, so it comes
  // first. TypeScript also keeps the parameter type an inline `(o) => …` gets
  // from the first overload it tries, `Observable<A>` here, so that an inline
  // operator that drops still matches the last overload.
  <B>(
    this: Observable<unknown>,
    operator: ProvideInitialValueOperator<A, B>,
  ): InitializedObservable<B>;

  <B>(
    this: Initialized,
    operator: KeepInitialValueOperator<A, B>,
  ): InitializedObservable<B>;

  <B>(
    this: Observable<unknown>,
    operator: DropInitialValueOperator<A, B> | KeepInitialValueOperator<A, B>,
  ): Observable<B>;
};
