import { IList, Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  InitializedObservable,
  InitializedToInitializedOperator,
  Observable,
  ToBaseOperator,
  Token,
  WithBufferedFromOperatorObservable,
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
      currentValueInit: Maybe.isNone(parentObservable.currentValue)
        ? Maybe.none
        : Maybe.some([
            parentObservable.currentValue.value,
            Maybe.isNone(observable.currentValue)
              ? []
              : [observable.currentValue.value],
          ]),
    });

    observable.subscribe((value) => {
      this.#mut_bufferedValues = IList.push(this.#mut_bufferedValues, value);
    });
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update

    this.setNext([par.currentValue.value, this.#mut_bufferedValues], token);
    this.#clearBuffer();
  }

  #clearBuffer(): void {
    this.#mut_bufferedValues = [];
  }
}
