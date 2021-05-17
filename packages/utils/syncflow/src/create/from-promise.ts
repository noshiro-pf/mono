import { Option, Result } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class';
import type { FromPromiseObservable } from '../types';

export const fromPromise = <A, E = unknown>(
  promise: Readonly<Promise<A>>
): FromPromiseObservable<A, E> => new FromPromiseObservableClass(promise);

class FromPromiseObservableClass<A, E = unknown>
  extends RootObservableClass<Result<A, E>, 'FromPromise'>
  implements FromPromiseObservable<A, E>
{
  constructor(promise: Readonly<Promise<A>>) {
    super({ type: 'FromPromise', currentValueInit: Option.none });

    promise
      .then((value) => {
        if (this.isCompleted) return;
        this.startUpdate(Result.ok(value));
      })
      .catch((error: E) => {
        if (this.isCompleted) return;
        this.startUpdate(Result.err(error));
      })
      .finally(() => {
        this.complete();
      });
  }
}
