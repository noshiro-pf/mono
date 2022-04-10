import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  Observable,
  RemoveInitializedOperator,
  SkipUntilOperatorObservable,
  Token,
} from '../types';

export const skipUntil =
  <A>(notifier: Observable<unknown>): RemoveInitializedOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new SkipUntilObservableClass(parentObservable, notifier);

class SkipUntilObservableClass<A>
  extends SyncChildObservableClass<A, 'skipUntil', [A]>
  implements SkipUntilOperatorObservable<A>
{
  #isSkipping: boolean;
  constructor(parentObservable: Observable<A>, notifier: Observable<unknown>) {
    super({
      parents: [parentObservable],
      type: 'skipUntil',
      currentValueInit: Maybe.none,
    });

    this.#isSkipping = true;

    notifier.subscribe(
      () => {
        this.#isSkipping = false;
      },
      () => {
        this.#isSkipping = false;
      }
    );
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update
    if (this.#isSkipping) return;

    this.setNext(par.currentValue.value, token);
  }
}
