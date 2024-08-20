import { Arr, Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type KeepInitialValueOperator,
  type Observable,
  type UpdaterSymbol,
  type WithBufferedFromOperatorObservable,
} from '../types/index.mjs';
import { maxDepth } from '../utils/index.mjs';

export const withBufferedFrom = <A, B>(
  observable: Observable<B>,
): KeepInitialValueOperator<A, readonly [A, readonly B[]]> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    new WithBufferedFromObservableClass(
      parentObservable,
      observable,
    )) as KeepInitialValueOperator<A, readonly [A, readonly B[]]>;

export const withBuffered = withBufferedFrom; // alias

class WithBufferedFromObservableClass<A, B>
  extends SyncChildObservableClass<readonly [A, readonly B[]], readonly [A]>
  implements WithBufferedFromOperatorObservable<A, B>
{
  #mut_bufferedValues: readonly B[] = [];

  constructor(parentObservable: Observable<A>, observable: Observable<B>) {
    super({
      parents: [parentObservable],
      depth: 1 + maxDepth([parentObservable, observable]),
      initialValue: Maybe.isNone(parentObservable.snapshot)
        ? Maybe.none
        : Maybe.some([
            parentObservable.snapshot.value,
            Maybe.isNone(observable.snapshot)
              ? []
              : [observable.snapshot.value],
          ]),
    });

    observable.subscribe((value) => {
      this.#mut_bufferedValues = Arr.pushed(this.#mut_bufferedValues, value);
    });
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.setNext([par.snapshot.value, this.#mut_bufferedValues], updaterSymbol);
    this.#clearBuffer();
  }

  #clearBuffer(): void {
    this.#mut_bufferedValues = [];
  }
}
