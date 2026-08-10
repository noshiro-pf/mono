import { expectType, Maybe } from '@noshiro/ts-utils';
import { InitializedSyncChildObservableClass } from '../class/index.mjs';
import { source } from '../create/index.mjs';
import {
  type InitializedObservable,
  type Observable,
  type SetInitialValueOperator,
  type SetInitialValueOperatorObservable,
  type UpdaterSymbol,
} from '../types/index.mjs';

export const setInitialValue =
  <A, I = A>(initialValue: I): SetInitialValueOperator<A, A | I> =>
  (parentObservable) =>
    new SetInitialValueObservableClass(parentObservable, initialValue);

class SetInitialValueObservableClass<A, I>
  extends InitializedSyncChildObservableClass<A | I, readonly [A]>
  implements SetInitialValueOperatorObservable<A, I>
{
  constructor(parentObservable: Observable<A>, initialValue: I) {
    super({
      parents: [parentObservable],
      initialValue: Maybe.some(initialValue),
    });
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(sn)) {
      return; // skip update
    }

    this.setNext(sn.value, updaterSymbol);
  }
}

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

  {
    const s = source<number>();
    const _d: InitializedObservable<number> = s.chain(setInitialValue(0));

    expectType<typeof _d, InitializedObservable<number>>('=');
  }
}
