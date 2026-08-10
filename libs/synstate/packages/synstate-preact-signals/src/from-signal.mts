import { effect, type ReadonlySignal, type Signal } from '@preact/signals';
import { source, type InitializedSourceObservable } from 'synstate';

/**
 * Converts a Preact `Signal` (or `ReadonlySignal`) into a synstate
 * `InitializedSourceObservable`.
 *
 * This allows applying synstate's rich operator chain (e.g. `map`, `filter`,
 * `debounce`, `switchMap`) to values originating from Preact Signals.
 *
 * The bridge uses `effect()` from `@preact/signals` to track signal changes
 * and propagate them to the observable.
 *
 * @returns A tuple of `[observable, dispose]`.
 *   - `observable` — an `InitializedSourceObservable` that mirrors the signal.
 *   - `dispose` — a function to stop tracking the signal. Call this when the
 *     bridge is no longer needed to avoid memory leaks.
 *
 * @example
 * ```ts
 * const input = signal('hello');
 *
 * const [input$, dispose] = fromSignal(input);
 *
 * const mut_valueHistory: string[] = [];
 *
 * input$.subscribe((value) => {
 *   mut_valueHistory.push(value);
 * });
 *
 * assert.deepStrictEqual(mut_valueHistory, ['hello']);
 *
 * input.value = 'world';
 *
 * assert.deepStrictEqual(mut_valueHistory, ['hello', 'world']);
 *
 * dispose(); // stop tracking the signal
 * ```
 */
export const fromSignal = <A,>(
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sig: ReadonlySignal<A> | Signal<A>,
): readonly [
  observable: InitializedSourceObservable<A>,
  dispose: () => void,
] => {
  const src = source<A>(sig.value);

  const dispose = effect(() => {
    src.next(sig.value);
  });

  return [src, dispose] as const;
};
