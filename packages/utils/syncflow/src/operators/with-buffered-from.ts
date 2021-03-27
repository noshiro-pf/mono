import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  InitializedObservable,
  InitializedToInitializedOperator,
  Observable,
  ToBaseOperator,
  Token,
  WithBufferedFromOperatorObservable,
} from '../types';
import { maxDepth } from '../utils';

export const withBufferedFrom = <A, B>(
  observable: Observable<B>
): ToBaseOperator<A, [A, B[]]> => (parent: Observable<A>) =>
  new WithBufferedFromObservableClass(parent, observable);

export const withBufferedFromI = <A, B>(
  observable: InitializedObservable<B>
): InitializedToInitializedOperator<A, [A, B[]]> =>
  withBuffered(observable) as InitializedToInitializedOperator<A, [A, B[]]>;

export const withBuffered = withBufferedFrom; // alias
export const withBufferedI = withBufferedFromI; // alias

class WithBufferedFromObservableClass<A, B>
  extends SyncChildObservableClass<[A, B[]], 'withBufferedFrom', [A]>
  implements WithBufferedFromOperatorObservable<A, B> {
  private readonly _bufferedValues: B[] = [];

  constructor(parent: Observable<A>, observable: Observable<B>) {
    super({
      parents: [parent],
      depth: 1 + maxDepth([parent, observable]),
      type: 'withBufferedFrom',
      currentValueInit: Option.isNone(parent.currentValue)
        ? Option.none
        : Option.some([
            parent.currentValue.value,
            Option.isNone(observable.currentValue)
              ? []
              : [observable.currentValue.value],
          ]),
    });

    observable.subscribe((value) => {
      this._bufferedValues.push(value);
    });
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this.setNext([parent.currentValue.value, this._bufferedValues], token);
    this.clearBuffer();
  }

  private clearBuffer(): void {
    this._bufferedValues.splice(0, this._bufferedValues.length);
  }
}
