import { Maybe } from '@noshiro/ts-utils';
import { AsyncChildObservableClass } from '../class/index.mjs';
import {
  type DropInitialValueOperator,
  type Observable,
  type Subscription,
  type SwitchMapOperatorObservable,
  type UpdaterSymbol,
} from '../types/index.mjs';

/**
 * @deprecated To improve the readability of your code, use `createState`
 *   instead of `switchMap`, and subscribe to `parentObservable` and call
 *   `setState` within it.
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
  #observable: Observable<B> | undefined;
  #subscription: Subscription | undefined;

  constructor(
    parentObservable: Observable<A>,
    mapToObservable: (curr: A) => Observable<B>,
  ) {
    super({
      parents: [parentObservable],
      initialValue: Maybe.none,
    });
    this.#mapToObservable = mapToObservable;
    this.#observable = undefined;
    this.#subscription = undefined;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(sn)) {
      return; // skip update
    }

    this.#observable?.complete();
    this.#subscription?.unsubscribe();

    const observable = this.#mapToObservable(sn.value);
    this.#observable = observable;

    const subscription = observable.subscribe((curr) => {
      this.startUpdate(curr);
    });
    this.#subscription = subscription;
  }

  override complete(): void {
    this.#subscription?.unsubscribe();
    this.#observable?.complete();
    super.complete();
  }
}
