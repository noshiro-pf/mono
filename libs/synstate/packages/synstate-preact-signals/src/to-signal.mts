import { signal, type ReadonlySignal } from '@preact/signals';
import { type InitializedObservable, type Observable } from 'synstate';
import { Optional } from 'ts-data-forge';

/**
 * Converts a synstate `InitializedObservable` into a Preact `ReadonlySignal`.
 *
 * The signal automatically stays in sync with the observable. Since the
 * observable has an initial value, the returned signal is guaranteed to hold a
 * value of type `A`.
 *
 * The subscription lives for the lifetime of the observable (until it
 * completes).
 *
 * @example
 * ```ts
 * const count$ = source<number>(0);
 *
 * const countSignal = toSignal(count$);
 *
 * assert.strictEqual(countSignal.value, 0);
 *
 * count$.next(1);
 *
 * assert.strictEqual(countSignal.value, 1);
 *
 * count$.next(42);
 *
 * assert.strictEqual(countSignal.value, 42);
 * ```
 */
export function toSignal<A>(
  observable$: InitializedObservable<A>,
): ReadonlySignal<A>;

/**
 * Converts a synstate `Observable` (without guaranteed initial value) into a
 * Preact `ReadonlySignal`. The signal value may be `undefined` until the
 * observable emits.
 */
export function toSignal<A>(
  observable$: Observable<A>,
): ReadonlySignal<A | undefined>;

/**
 * Converts a synstate `Observable` into a Preact `ReadonlySignal` with a
 * fallback value used when the observable has not yet emitted.
 */
export function toSignal<A, B = A>(
  observable$: Observable<A>,
  fallback: B,
): ReadonlySignal<A | B>;

export function toSignal<A, B = A>(
  observable$: Observable<A>,
  fallback?: B,
): ReadonlySignal<A | B | undefined> {
  const initialValue = Optional.unwrapOr(observable$.getSnapshot(), fallback);

  const sig = signal<A | B | undefined>(initialValue);

  observable$.subscribe((value) => {
    // eslint-disable-next-line functional/immutable-data
    sig.value = value;
  });

  return sig;
}
