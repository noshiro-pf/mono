// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding; an observable is a class (`ObservableBaseClass` says why), so
// those rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import { Optional, Result } from 'ts-data-forge';
import { RootObservableClass } from '../class/index.mjs';
import type {
  FromSubscribableObservable,
  Subscribable,
  Subscription,
} from '../types/index.mjs';
import { runUndoingOnThrow } from '../utils/index.mjs';

/**
 * Converts any subscribable object into a SynState Observable.
 * Works with objects that have a subscribe(onNext, onError, onComplete) method.
 *
 * Each value is passed on as `Result.ok(value)`. An error is passed on as
 * `Result.err(error)` and ends the observable, as an error ends an RxJS or
 * TC39-style observable and a rejection ends `fromPromise`: the observable
 * completes after the `Err`, unsubscribes from the subscribable, and ignores
 * anything the subscribable passes on later.
 *
 * @template A - The type of values from the subscribable
 * @template E - The type of errors from the subscribable
 * @param subscribable - An object with a subscribe method
 * @returns An observable that wraps values in Result type
 *
 * @example
 * ```ts
 * //  Explanation:
 * //  - fromSubscribable converts any subscribable object into a SynState Observable
 * //  - Works with objects that have a subscribe(onNext, onError, onComplete) method
 * //  - Wraps values in Result type for error handling
 * //  - Useful for integrating with other reactive libraries or custom subscribables
 *
 * // Example: Converting a custom subscribable
 * const customSubscribable = {
 *   subscribe: (
 *     onNext: (value: number) => void,
 *     _onError?: (error: unknown) => void,
 *     onComplete?: () => void,
 *   ) => {
 *     setTimeout(() => {
 *       onNext(1);
 *
 *       onNext(2);
 *
 *       onNext(3);
 *
 *       onComplete?.();
 *     }, 0);
 *
 *     return { unsubscribe: () => {} };
 *   },
 * } as const;
 *
 * const observable$ = fromSubscribable<number>(customSubscribable);
 *
 * const valueHistory: number[] = [];
 *
 * await new Promise<void>((resolve) => {
 *   observable$.subscribe(
 *     (result) => {
 *       if (Result.isOk(result)) {
 *         valueHistory.push(result.value);
 *       }
 *     },
 *     () => {
 *       resolve();
 *     },
 *   );
 * });
 *
 * assert.deepStrictEqual(valueHistory, [1, 2, 3]);
 * ```
 */
export const fromSubscribable = <A, E = unknown>(
  subscribable: Subscribable<A>,
): FromSubscribableObservable<A, E> =>
  new FromSubscribableObservableClass(subscribable);

class FromSubscribableObservableClass<A, E = unknown>
  extends RootObservableClass<Result<A, E>>
  implements FromSubscribableObservable<A, E>
{
  readonly #mut_subscription: Subscription | undefined;

  /**
   * How the subscribable's stream ended, if it has. Once it has, whatever the
   * subscribable passes on is ignored: after an error, its `Err` is the last
   * value, even what it passes on from inside `unsubscribe`. Once it has
   * completed, its subscription is over, so completing this observable must not
   * unsubscribe from it.
   */
  #mut_sourceEnd: 'live' | 'errored' | 'completed';

  /**
   * Set while and after this observable calls `unsubscribe`. An error the
   * subscribable reports from inside `unsubscribe` completes this observable
   * from within its teardown; this keeps that completion's teardown from
   * calling `unsubscribe` again, which would report again, without end (a
   * completion reported there is kept from it by `#mut_sourceEnd`). Cleared if
   * `unsubscribe` throws, so that a retried `complete()` calls it again from
   * the teardown. Kept apart from `#mut_sourceEnd` because an end reported from
   * inside `unsubscribe` must still be taken, and because a throw rolls this
   * back but never the end.
   */
  #mut_hasUnsubscribed: boolean;

  constructor(subscribable: Subscribable<A>) {
    super({ initialValue: Optional.none });

    this.#mut_subscription = undefined;

    this.#mut_sourceEnd = 'live';

    this.#mut_hasUnsubscribed = false;

    const subscription = subscribable.subscribe(
      (nextValue) => {
        if (this.#mut_sourceEnd !== 'live') {
          return;
        }

        this.startUpdate(Result.ok(nextValue));
      },
      (error?: unknown) => {
        if (this.#mut_sourceEnd !== 'live') {
          return;
        }

        this.#mut_sourceEnd = 'errored';

        // An error ends the subscribable's stream, so it ends this observable
        // even when a subscriber throws on the `Err`, as `fromPromise` does:
        // the subscribers and children the exception kept from the `Err` are
        // completed without it, rather than left open for good. The
        // subscriber's exception is not caught: it reaches the subscribable,
        // unless completing throws too and replaces it.
        // @sumi-expect-error exceptions/no-try
        try {
          this.startUpdate(
            Result.err(
              // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
              error as E,
            ),
          );
        } finally {
          // Completing unsubscribes: a no-op for a subscription the error
          // already closed, as RxJS's and the TC39 proposal's are, and what
          // stops a hand-written subscribable that would go on calling back.
          this.complete();
        }
      },
      () => {
        if (this.#mut_sourceEnd !== 'live') {
          return;
        }

        this.#mut_sourceEnd = 'completed';

        this.complete();
      },
    );

    // `subscribe` may have completed this observable already.
    if (this.isCompleted) {
      this.#unsubscribe(subscription);
    } else {
      this.#mut_subscription = subscription;
    }
  }

  #unsubscribe(subscription: Subscription): void {
    if (this.#mut_sourceEnd === 'completed' || this.#mut_hasUnsubscribed) {
      return;
    }

    this.#mut_hasUnsubscribed = true;

    runUndoingOnThrow(
      () => {
        subscription.unsubscribe();
      },
      () => {
        this.#mut_hasUnsubscribed = false;
      },
    );
  }

  protected override teardown(): void {
    if (this.#mut_subscription !== undefined) {
      this.#unsubscribe(this.#mut_subscription);
    }
  }
}
