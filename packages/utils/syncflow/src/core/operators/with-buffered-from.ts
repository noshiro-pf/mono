import { Arr, Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  type InitializedObservable,
  type InitializedToInitializedOperator,
  type Observable,
  type ToBaseOperator,
  type UpdaterSymbol,
  type WithBufferedFromOperatorObservable,
} from '../types';
import { maxDepth } from '../utils';

export const withBufferedFrom =
  <A, B>(
    observable: Observable<B>
  ): ToBaseOperator<A, readonly [A, readonly B[]]> =>
  (parentObservable: Observable<A>) =>
    new WithBufferedFromObservableClass(parentObservable, observable);

export const withBufferedFromI = <A, B>(
  observable: InitializedObservable<B>
): InitializedToInitializedOperator<A, readonly [A, readonly B[]]> =>
  withBuffered(observable) as InitializedToInitializedOperator<
    A,
    readonly [A, readonly B[]]
  >;

export const withBuffered = withBufferedFrom; // alias
export const withBufferedI = withBufferedFromI; // alias

class WithBufferedFromObservableClass<A, B>
  extends SyncChildObservableClass<
    readonly [A, readonly B[]],
    'withBufferedFrom',
    readonly [A]
  >
  implements WithBufferedFromOperatorObservable<A, B>
{
  #mut_bufferedValues: readonly B[] = [];

  constructor(parentObservable: Observable<A>, observable: Observable<B>) {
    super({
      parents: [parentObservable],
      depth: 1 + maxDepth([parentObservable, observable]),
      type: 'withBufferedFrom',
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
