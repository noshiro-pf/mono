import { Maybe, SafeUint, idfn, pipe, toSafeUint } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type DropInitialValueOperator,
  type Observable,
  type SkipWhileOperatorObservable,
  type UpdaterSymbol,
} from '../types/index.mjs';
import { isPositiveSafeInteger } from '../utils/index.mjs';

export const skipWhile =
  <A,>(
    predicate: (value: A, index: SafeUint | -1) => boolean,
  ): DropInitialValueOperator<A, A> =>
  (parentObservable) =>
    new SkipWhileObservableClass(parentObservable, predicate);

/* Specialized operators */

export const skip = <A,>(
  n: PositiveSafeIntWithSmallInt,
): DropInitialValueOperator<A, A> =>
  !isPositiveSafeInteger(n) ? idfn : skipWhile((_, index) => index + 1 <= n);

/* implementation */

class SkipWhileObservableClass<A>
  extends SyncChildObservableClass<A, readonly [A]>
  implements SkipWhileOperatorObservable<A>
{
  readonly #predicate: (value: A, index: SafeUint | -1) => boolean;
  #mut_index: SafeUint | -1;

  constructor(
    parentObservable: Observable<A>,
    predicate: (value: A, index: SafeUint | -1) => boolean,
  ) {
    super({
      parents: [parentObservable],
      initialValue: pipe(parentObservable.getSnapshot()).chain((sn) =>
        Maybe.isNone(sn)
          ? Maybe.none
          : predicate(sn.value, -1)
            ? Maybe.none
            : sn,
      ).value,
    });

    this.#mut_index = -1;
    this.#predicate = predicate;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(sn)) {
      return; // skip update
    }

    this.#mut_index =
      this.#mut_index === -1 ? toSafeUint(0) : SafeUint.add(1, this.#mut_index);

    if (!this.#predicate(sn.value, this.#mut_index)) {
      this.setNext(sn.value, updaterSymbol);
    }
  }
}
