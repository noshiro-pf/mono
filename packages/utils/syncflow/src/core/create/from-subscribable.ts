import { Maybe, Result } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class';
import { type FromSubscribableObservable, type Subscribable } from '../types';

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
        // eslint-disable-next-line no-restricted-syntax
        this.startUpdate(Result.err(error as E));
      },
      () => {
        this.complete();
      },
    );
  }
}
