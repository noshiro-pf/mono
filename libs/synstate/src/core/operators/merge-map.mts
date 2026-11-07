// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding; an observable is a class (`ObservableBaseClass` says why), so
// those rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import { Optional } from 'ts-data-forge';
import type { MutableMap } from 'ts-type-forge';
import { AsyncChildObservableClass } from '../class/index.mjs';
import { createScope, getCurrentScope } from '../scope/index.mjs';
import type {
  DropInitialValueOperator,
  MergeMapOperatorObservable,
  Observable,
  Scope,
  Subscription,
  UpdateToken,
} from '../types/index.mjs';
import { runUndoingOnThrow } from '../utils/index.mjs';

/**
 * Projects each source value to an observable and merges all inner observables.
 * Unlike `switchMap`, does not cancel previous inner observables.
 *
 * A value the source already holds when `mergeMap` is created is projected at
 * once, as with `switchMap`. A completed source is not projected.
 *
 * Each projection runs in a scope of its own (see `createScope`): what it
 * creates is disposed when the observable it returned completes, or when
 * `mergeMap` completes, whichever comes first. An observable it only returns —
 * one created outside the projection and shared with others — is unsubscribed
 * and left running.
 *
 * If the projection or the subscription to it throws, its scope is disposed.
 *
 * @template A - The type of values from the source
 * @template B - The type of values from the projected observable
 * @param mapToObservable - A function that maps each source value to an observable
 * @returns An operator that merges mapped observables
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  input$      A                          B              C
 * //  inner A     A1    A2    A3
 * //  inner B                                B1    B2             B3
 * //  inner C                                              C1         C2    C3
 * //  result$     A1    A2    A3              B1    B2      C1    B3   C2    C3
 * //
 * //  Explanation:
 * //  - mergeMap creates an inner observable for each source value
 * //  - Unlike switchMap, previous inner observables are NOT cancelled
 * //  - B's inner continues even after C arrives (B3 is still emitted)
 * //  - All inner observables run concurrently and their results are merged
 *
 * const input$ = source<string>();
 *
 * const result$ = input$.pipe(
 *   mergeMap((letter) => {
 *     const inner$ = source<string>();
 *
 *     setTimeout(() => {
 *       inner$.next(`${letter}1`);
 *     }, 10);
 *
 *     setTimeout(() => {
 *       inner$.next(`${letter}2`);
 *     }, 110);
 *
 *     setTimeout(() => {
 *       inner$.next(`${letter}3`);
 *     }, 210);
 *
 *     return inner$;
 *   }),
 * );
 *
 * const valueHistory: string[] = [];
 *
 * result$.subscribe((value) => {
 *   valueHistory.push(value);
 * });
 *
 * const sleep = (ms: number): Promise<void> =>
 *   new Promise((resolve) => {
 *     setTimeout(resolve, ms);
 *   });
 *
 * // Emit A - inner emits A1, A2, A3 at 10ms, 110ms, 210ms
 * input$.next('A');
 *
 * await sleep(250);
 *
 * assert.deepStrictEqual(valueHistory, ['A1', 'A2', 'A3']);
 *
 * // Emit B - inner starts emitting B1, B2 at 10ms, 110ms
 * input$.next('B');
 *
 * await sleep(150);
 *
 * assert.deepStrictEqual(valueHistory, ['A1', 'A2', 'A3', 'B1', 'B2']);
 *
 * // Emit C while B's inner is still running (B3 at 210ms not yet fired)
 * // Unlike switchMap, B's inner is NOT cancelled
 * input$.next('C');
 *
 * await sleep(250);
 *
 * // B3 appears between C1 and C2, showing the merge behavior
 * assert.deepStrictEqual(valueHistory, [
 *   'A1',
 *   'A2',
 *   'A3',
 *   'B1',
 *   'B2',
 *   'C1',
 *   'B3',
 *   'C2',
 *   'C3',
 * ]);
 * ```
 */
export const mergeMap =
  <A, B>(
    mapToObservable: (curr: A) => Observable<B>,
  ): DropInitialValueOperator<A, B> =>
  (parentObservable) =>
    new MergeMapObservableClass(parentObservable, mapToObservable);

/**
 * Alias for `mergeMap`.
 * @see mergeMap
 */
export const flatMap = mergeMap;

class MergeMapObservableClass<A, B>
  extends AsyncChildObservableClass<B, readonly [A]>
  implements MergeMapOperatorObservable<A, B>
{
  readonly #mapToObservable: (curr: A) => Observable<B>;

  /** See `SwitchMapObservableClass`. */
  readonly #ownerScope: Scope | undefined;

  /**
   * The inner observables still live, by the scope their projection ran in.
   * One that completes is released at once, so a long-lived `mergeMap` holds
   * only those (#2769).
   */
  readonly #mut_liveInners: MutableMap<Scope, Subscription | undefined>;

  constructor(
    parentObservable: Observable<A>,
    mapToObservable: (curr: A) => Observable<B>,
  ) {
    super({
      parents: [parentObservable],
      initialValue: Optional.none,
    });

    this.#mapToObservable = mapToObservable;

    this.#ownerScope = getCurrentScope();

    this.#mut_liveInners = new Map<Scope, Subscription | undefined>();

    this.attachProjectingHeldValue(parentObservable, (value, updateToken) => {
      this.#project(value, updateToken);
    });
  }

  /**
   * Unsubscribes from an inner observable and disposes what its projection
   * made.
   */
  #releaseInner(innerScope: Scope): void {
    this.#mut_liveInners.get(innerScope)?.unsubscribe();

    this.#mut_liveInners.delete(innerScope);

    innerScope.dispose();
  }

  /** Adds the inner observable of `value` to those merged. */
  #project(value: A, updateToken: UpdateToken): void {
    const innerScope = createScope(this.#ownerScope);

    // Held before the projection runs, so that `teardown` releases it if
    // `mergeMap` completes during the projection or while the inner observable
    // is being subscribed.
    this.#mut_liveInners.set(innerScope, undefined);

    // Released at once if the projection throws, or the subscription does,
    // rather than held until `mergeMap` completes.
    runUndoingOnThrow(
      () => {
        const observable = innerScope.run(() => this.#mapToObservable(value));

        // Released during the projection: `mergeMap` completed (#3550).
        if (!this.#mut_liveInners.has(innerScope)) {
          return;
        }

        const subscription = this.subscribeInner(
          observable,
          updateToken,
          () => {
            this.#releaseInner(innerScope);
          },
        );

        if (this.#mut_liveInners.has(innerScope)) {
          this.#mut_liveInners.set(innerScope, subscription);
        } else {
          // Released while it was subscribed: the inner observable completed
          // (`just(x)`), or `mergeMap` did.
          subscription.unsubscribe();
        }
      },
      () => {
        this.#releaseInner(innerScope);
      },
    );
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updateToken !== updateToken || Optional.isNone(sn)) {
      return; // skip update
    }

    this.#project(sn.value, updateToken);
  }

  /** Releases the inner observables, and only those this operator made. */
  protected override teardown(): void {
    for (const innerScope of this.#mut_liveInners.keys()) {
      this.#releaseInner(innerScope);
    }
  }
}
