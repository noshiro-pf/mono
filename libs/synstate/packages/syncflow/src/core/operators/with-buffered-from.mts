import { Arr, Optional, pipe } from 'ts-data-forge';
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
      initialValue: pipe({
        par: parentObservable.getSnapshot(),
        me: observable.getSnapshot(),
      }).map(({ par, me }) =>
        Optional.isNone(par)
          ? Optional.none
          : Optional.some([
              par.value,
              Optional.isNone(me) ? [] : [me.value],
            ] as const),
      ).value,
    });

    observable.subscribe((value) => {
      this.#mut_bufferedValues = Arr.toPushed(this.#mut_bufferedValues, value);
    });
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Optional.isNone(sn)) {
      return; // skip update
    }

    this.setNext([sn.value, this.#mut_bufferedValues], updaterSymbol);

    this.#clearBuffer();
  }

  #clearBuffer(): void {
    this.#mut_bufferedValues = [];
  }
}
