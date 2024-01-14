import { Maybe, Result } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class/index.mjs';
import { type FromPromiseObservable } from '../types/index.mjs';

export const fromPromise = <A, E = unknown>(
  promise: Readonly<Promise<A>>,
): FromPromiseObservable<A, E> => new FromPromiseObservableClass(promise);

class FromPromiseObservableClass<A, E = unknown>
  extends RootObservableClass<Result<A, E>, 'FromPromise'>
  implements FromPromiseObservable<A, E>
{
  constructor(promise: Readonly<Promise<A>>) {
    super({ type: 'FromPromise', initialValue: Maybe.none });

    promise
      .then((value) => {
        if (this.isCompleted) return;
        this.startUpdate(Result.ok(value));
      })
      .catch((error: unknown) => {
        if (this.isCompleted) return;
        // eslint-disable-next-line no-restricted-syntax
        this.startUpdate(Result.err(error as E));
      })
      .finally(() => {
        this.complete();
      });
  }
}
