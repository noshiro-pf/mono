import { Maybe, Result } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class/index.mjs';
import {
  type FromSubscribableObservable,
  type Subscribable,
} from '../types/index.mjs';

export const fromSubscribable = <A, E = unknown>(
  subscribable: Subscribable<A>,
): FromSubscribableObservable<A, E> =>
  new FromSubscribableObservableClass(subscribable);

class FromSubscribableObservableClass<A, E = unknown>
  extends RootObservableClass<Result<A, E>, 'FromSubscribable'>
  implements FromSubscribableObservable<A, E>
{
  constructor(subscribable: Subscribable<A>) {
    super({ type: 'FromSubscribable', initialValue: Maybe.none });

    subscribable.subscribe(
      (nextValue) => {
        this.startUpdate(Result.ok(nextValue));
      },
      (error?: unknown) => {
        this.startUpdate(
          Result.err(
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            error as E,
          ),
        );
      },
      () => {
        this.complete();
      },
    );
  }
}
