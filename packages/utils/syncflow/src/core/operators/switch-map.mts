import { Maybe } from '@noshiro/ts-utils';
import { AsyncChildObservableClass } from '../class/index.mjs';
import {
  type Observable,
  type RemoveInitializedOperator,
  type Subscription,
  type SwitchMapOperatorObservable,
  type UpdaterSymbol,
} from '../types/index.mjs';

/** @deprecated use `createState` instead */
export const switchMap =
  <A, B>(
    mapToObservable: (curr: A) => Observable<B>,
  ): RemoveInitializedOperator<A, B> =>
  (parentObservable: Observable<A>) =>
    new SwitchMapObservableClass(parentObservable, mapToObservable);

class SwitchMapObservableClass<A, B>
  extends AsyncChildObservableClass<B, 'switchMap', readonly [A]>
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
      type: 'switchMap',
      initialValue: Maybe.none,
    });
    this.#mapToObservable = mapToObservable;
    this.#observable = undefined;
    this.#subscription = undefined;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.#observable?.complete();
    this.#subscription?.unsubscribe();

    const observable = this.#mapToObservable(par.snapshot.value);
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