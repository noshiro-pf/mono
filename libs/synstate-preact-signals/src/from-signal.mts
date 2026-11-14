import { effect, type ReadonlySignal, type Signal } from '@preact/signals';
import { source, type InitializedSourceObservable } from 'synstate';

/**
 * Converts a Preact `Signal` (or `ReadonlySignal`) into a synstate
 * `InitializedSourceObservable`.
 *
 * This allows applying synstate's rich operator chain (e.g. `map`, `filter`,
 * `debounce`, `switchMap`) to values originating from Preact Signals.
 *
 * The bridge subscribes to the signal with its `subscribe` method and passes
 * each new value on to the observable. A signal that a subscriber or an
 * operator of the observable reads is not tracked: only a change of the signal
 * itself makes the observable emit. That needs `@preact/signals-core` 1.2.0 or
 * later, which every `@preact/signals` from 1.1.0 depends on; with an older
 * core such a read still makes the observable emit again.
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
  // `peek`, so that a `fromSignal` called inside an effect or a computed does
  // not make the enclosing effect or computed depend on the signal.
  const src = source<A>(sig.peek());

  const pass = (value: A): void => {
    src.next(value);
  };

  // From `@preact/signals-core` 1.2.0, `subscribe` does not track what its
  // callback reads, so a signal that a subscriber or a projection of the
  // observable reads while `next` runs is not taken for a dependency of the
  // bridge; core 1.1 tracks it, as an effect does. Core 1.0, which the peer
  // range admits, has no `subscribe` although the installed types declare one,
  // so the bridge follows the signal with an effect there rather than throw.
  // Either calls back once before returning, with the signal's current value;
  // nothing can have subscribed to the source yet, so no one sees what it held
  // before.
  // The bridge is not tied to the synstate scope `fromSignal` runs in: a scope
  // that disposes the source leaves the subscription to the signal live until
  // `dispose` is called.
  const dispose =
    typeof sig.subscribe === 'function'
      ? sig.subscribe(pass)
      : effect(() => {
          pass(sig.value);
        });

  return [src, dispose] as const;
};
