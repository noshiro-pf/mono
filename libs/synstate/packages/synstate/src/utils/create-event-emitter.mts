import { source, type Observable } from '../core/index.mjs';

/**
 * Creates an event emitter for void events (events without payload).
 * Returns a tuple of [observable, emitter function].
 *
 * @returns A tuple containing the observable and the emitter function
 *
 * @example
 * ```ts
 * const [click$, emitClick] = createEventEmitter();
 *
 * const mut_clickCount = { value: 0 };
 *
 * click$.subscribe(() => {
 *   mut_clickCount.value += 1;
 * });
 *
 * emitClick(); // logs: Clicked!
 *
 * assert.deepStrictEqual(mut_clickCount.value, 1);
 *
 * emitClick();
 *
 * emitClick();
 *
 * assert.deepStrictEqual(mut_clickCount.value, 3);
 * ```
 */
export const createEventEmitter = (): readonly [
  Observable<void>,
  () => void,
] => {
  const src$ = source<undefined>();

  const emitter = (): void => {
    src$.next(undefined);
  };

  return [src$, emitter];
};

/**
 * Creates an event emitter with typed payload.
 * Returns a tuple of [observable, emitter function].
 *
 * @template A - The type of the event payload
 * @returns A tuple containing the observable and the emitter function
 *
 * @example
 * ```ts
 * const [message$, emitMessage] = createValueEmitter<string>();
 *
 * const mut_history: string[] = [];
 *
 * message$.subscribe((msg) => {
 *   mut_history.push(msg);
 * });
 *
 * emitMessage('Hello'); // logs: Hello
 *
 * assert.deepStrictEqual(mut_history, ['Hello']);
 *
 * emitMessage('World');
 *
 * assert.deepStrictEqual(mut_history, ['Hello', 'World']);
 * ```
 */
export const createValueEmitter = <A,>(): readonly [
  Observable<A>,
  (value: A) => void,
] => {
  const src$ = source<A>();

  const emitter = (value: A): void => {
    src$.next(value);
  };

  return [src$, emitter];
};
