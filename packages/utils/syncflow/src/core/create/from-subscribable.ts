import { Maybe, Result } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class';
import type { FromSubscribableObservable, Subscribable } from '../types';

export const fromSubscribable = <A, E = unknown>(
  subscribable: Subscribable<A>
): FromSubscribableObservable<A, E> =>
  new FromSubscribableObservableClass(subscribable);

class FromSubscribableObservableClass<A, E = unknown>
  extends RootObservableClass<Result<A, E>, 'FromSubscribable'>
  implements FromSubscribableObservable<A, E>
{
  constructor(subscribable: Subscribable<A>) {
    super({ type: 'FromSubscribable', currentValueInit: Maybe.none });

    subscribable.subscribe(
      (nextValue) => {
        this.startUpdate(Result.ok(nextValue));
      },
      (error?: unknown) => {
        this.startUpdate(Result.err(error as E));
      },
      () => {
        this.complete();
      }
    );
  }
}
