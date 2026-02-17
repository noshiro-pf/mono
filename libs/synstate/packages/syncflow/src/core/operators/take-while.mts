import {
  Optional,
  SafeUint,
  asSafeUint,
  expectType,
  pipe,
} from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import { source } from '../create/index.mjs';
import {
  type DropInitialValueOperator,
  type InitializedObservable,
  type Observable,
  type TakeWhileOperatorObservable,
  type UpdaterSymbol,
} from '../types/index.mjs';
import { withInitialValue } from './with-initial-value.mjs';

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
  extends SyncChildObservableClass<A, readonly [A]>
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
      initialValue: pipe(parentObservable.getSnapshot()).map((par) =>
        Optional.isNone(par)
          ? Optional.none
          : predicate(par.value, -1)
            ? par
            : Optional.none,
      ).value,
    });

    this.#mut_index = -1;

    this.#predicate = predicate;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Optional.isNone(sn)) {
      return; // skip update
    }

    this.#mut_index =
      this.#mut_index === -1 ? asSafeUint(0) : SafeUint.add(1, this.#mut_index);

    if (this.#predicate(sn.value, this.#mut_index)) {
      this.setNext(sn.value, updaterSymbol);
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

    const _d1 = s.pipe(take(3));

    expectType<typeof _d1, Observable<number>>('=');
  }

  {
    const s = source<number>();

    const m: InitializedObservable<number> = s.pipe(withInitialValue(0));

    const _d = m.pipe(take(3));

    expectType<typeof _d, Observable<number>>('=');
  }
}
