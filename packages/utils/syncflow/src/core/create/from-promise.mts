import { Maybe, Result } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class/index.mjs';
import { type FromPromiseObservable } from '../types/index.mjs';

export const fromPromise = <A, E = unknown>(
  promise: Readonly<Promise<A>>,
): FromPromiseObservable<A, E> => new FromPromiseObservableClass(promise);

class FromPromiseObservableClass<A, E = unknown>
  extends RootObservableClass<Result<A, E>>
  implements FromPromiseObservable<A, E>
{
  constructor(promise: Readonly<Promise<A>>) {
    super({ initialValue: Maybe.none });

    promise
      .then((value) => {
        if (this.isCompleted) return;
        this.startUpdate(Result.ok(value));
      })
      .catch((error: unknown) => {
        if (this.isCompleted) return;

        this.startUpdate(
          Result.err(
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            error as E,
          ),
        );
      })
      .finally(() => {
        this.complete();
      });
  }
}
