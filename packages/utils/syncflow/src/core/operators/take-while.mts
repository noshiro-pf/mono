import { Maybe, SafeUint, expectType, toSafeUint } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import { source } from '../create/index.mjs';
import {
  type DropInitialValueOperator,
  type InitializedObservable,
  type Observable,
  type TakeWhileOperatorObservable,
  type UpdaterSymbol,
} from '../types/index.mjs';
import { setInitialValue } from './set-initial-value.mjs';

export const takeWhile =
  <A,>(
    predicate: (value: A, index: SafeUint | -1) => boolean,
  ): DropInitialValueOperator<A, A> =>
  (parentObservable) =>
    new TakeWhileObservableClass(parentObservable, predicate);

/* Specialized operators */

export const take = <A,>(
  n: PositiveSafeIntWithSmallInt,
): DropInitialValueOperator<A, A> => takeWhile((_, index) => index + 1 <= n);

/* implementation */

class TakeWhileObservableClass<A>
  extends SyncChildObservableClass<A, 'takeWhile', readonly [A]>
  implements TakeWhileOperatorObservable<A>
{
  readonly #predicate: (value: A, index: SafeUint | -1) => boolean;
  #mut_index: SafeUint | -1;

  constructor(
    parentObservable: Observable<A>,
    predicate: (value: A, index: SafeUint | -1) => boolean,
  ) {
    super({
      parents: [parentObservable],
      type: 'takeWhile',
      initialValue: Maybe.isNone(parentObservable.snapshot)
        ? Maybe.none
        : predicate(parentObservable.snapshot.value, -1)
          ? parentObservable.snapshot
          : Maybe.none,
    });

    this.#mut_index = -1;
    this.#predicate = predicate;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.#mut_index =
      this.#mut_index === -1 ? toSafeUint(0) : SafeUint.add(1, this.#mut_index);

    if (this.#predicate(par.snapshot.value, this.#mut_index)) {
      this.setNext(par.snapshot.value, updaterSymbol);
    } else {
      this.complete();
    }
  }
}

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

  {
    const s: Observable<number> = source<number>();
    const _d1 = s.chain(take(3));

    expectType<typeof _d1, Observable<number>>('=');
  }

  {
    const s = source<number>();
    const m: InitializedObservable<number> = s.chain(setInitialValue(0));
    const _d = m.chain(take(3));

    expectType<typeof _d, Observable<number>>('=');
  }
}
