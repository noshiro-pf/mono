import { Maybe, SafeUint, toSafeUint } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type InitializedToInitializedOperator,
  type Observable,
  type ToUninitializedOperator,
  type UpdaterSymbol,
  type WithIndexOperatorObservable,
} from '../types/index.mjs';

export const withIndex =
  <A,>(): ToUninitializedOperator<A, readonly [SafeUint | -1, A]> =>
  (parentObservable: Observable<A>) =>
    new WithIndexObservableClass(parentObservable);

export const withIndexI = <A,>(): InitializedToInitializedOperator<
  A,
  readonly [SafeUint | -1, A]
> =>
  // eslint-disable-next-line no-restricted-syntax
  withIndex() as InitializedToInitializedOperator<
    A,
    readonly [SafeUint | -1, A]
  >;

export const attachIndex = withIndex; // alias
export const attachIndexI = withIndexI; // alias

class WithIndexObservableClass<A>
  extends SyncChildObservableClass<
    readonly [SafeUint | -1, A],
    'withIndex',
    readonly [A]
  >
  implements WithIndexOperatorObservable<A>
{
  #mut_index: SafeUint | -1;

  constructor(parentObservable: Observable<A>) {
    super({
      parents: [parentObservable],
      type: 'withIndex',
      initialValue: Maybe.map(parentObservable.snapshot, (x) => [-1, x]),
    });
    this.#mut_index = -1;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.#mut_index =
      this.#mut_index === -1 ? toSafeUint(0) : SafeUint.add(this.#mut_index, 1);
    this.setNext([this.#mut_index, par.snapshot.value], updaterSymbol);
  }
}
