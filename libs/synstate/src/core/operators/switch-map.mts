// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding; an observable is a class (`ObservableBaseClass` says why),
// so those rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import { Optional } from 'ts-data-forge';
import { AsyncChildObservableClass } from '../class/index.mjs';
import { createScope, getCurrentScope } from '../scope/index.mjs';
import type {
  DropInitialValueOperator,
  Observable,
  Scope,
  Subscription,
  SwitchMapOperatorObservable,
  UpdateToken,
} from '../types/index.mjs';

/**
 * Projects each source value to an observable, subscribes to it, and emits its values.
 * When a new value arrives from the source, the previous inner observable is unsubscribed.
 *
 * The projection runs in a scope of its own (see `createScope`): what it
 * creates is disposed when the next value switches away from it and when
 * `switchMap` completes. An observable it only returns — one created outside
 * the projection and shared with others — is unsubscribed and left running.
 *
 * @template A - The type of values from the source
 * @template B - The type of values from the projected observable
 * @param mapToObservable - A function that maps each source value to an observable
 * @returns An operator that switches to new observables
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  input$      A                          B              C
 * //  inner A     A1    A2    A3
 * //  inner B                                B1    B2      (switched!)
 * //  inner C                                              C1    C2    C3
 * //  result$     A1    A2    A3              B1    B2      C1    C2    C3
 * //
 * //  Explanation:
 * //  - switchMap creates an inner observable for each source value
 * //  - When a new source value arrives, the previous inner is unsubscribed
 * //  - A's inner completes normally (all 3 values emitted)
 * //  - B's inner is interrupted by C (only 2 values emitted)
 * //  - C's inner completes normally (all 3 values emitted)
 *
 * const input$ = source<string>();
 *
 * const result$ = input$.pipe(
 *   switchMap((letter) => {
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
 * // Emit C - switches away from B (B3 cancelled), C's inner starts
 * input$.next('C');
 *
 * await sleep(250);
 *
 * assert.deepStrictEqual(valueHistory, [
 *   'A1',
 *   'A2',
 *   'A3',
 *   'B1',
 *   'B2',
 *   'C1',
 *   'C2',
 *   'C3',
 * ]);
 * ```
 */
export const switchMap =
  <A, B>(
    mapToObservable: (curr: A) => Observable<B>,
  ): DropInitialValueOperator<A, B> =>
  (parentObservable) =>
    new SwitchMapObservableClass(parentObservable, mapToObservable);

class SwitchMapObservableClass<A, B>
  extends AsyncChildObservableClass<B, readonly [A]>
  implements SwitchMapOperatorObservable<A, B>
{
  readonly #mapToObservable: (curr: A) => Observable<B>;

  /**
   * The scope the operator was created in, so that each inner scope is
   * disposed with it; the projection itself runs during propagation, when the
   * current scope is whatever happens to be running.
   */
  readonly #ownerScope: Scope | undefined;

  #mut_innerScope: Scope | undefined;
  #mut_subscription: Subscription | undefined;

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

    this.#mut_innerScope = undefined;

    this.#mut_subscription = undefined;

    this.attach();
  }

  /** Releases the inner observable, and only the one this operator made. */
  #releaseInner(): void {
    this.#mut_subscription?.unsubscribe();

    this.#mut_innerScope?.dispose();
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updateToken !== updateToken || Optional.isNone(sn)) {
      return; // skip update
    }

    this.#releaseInner();

    const innerScope = createScope(this.#ownerScope);

    this.#mut_innerScope = innerScope;

    const observable = innerScope.run(() => this.#mapToObservable(sn.value));

    this.#mut_subscription = observable.subscribe((curr) => {
      this.startUpdate(curr);
    });
  }

  protected override teardown(): void {
    this.#releaseInner();
  }
}
