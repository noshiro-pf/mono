import {
  expectType,
  Maybe,
  pipe,
  SafeUint,
  toSafeUint,
} from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import { source } from '../create/index.mjs';
import {
  type DropInitialValueOperator,
  type FilterOperatorObservable,
  type InitializedObservable,
  type Observable,
  type UpdaterSymbol,
} from '../types/index.mjs';
import { setInitialValue } from './set-initial-value.mjs';

export function filter<A, B extends A>(
  predicate: (value: A, index: SafeUint | -1) => value is B,
): DropInitialValueOperator<A, B>;
export function filter<A>(
  predicate: (value: A, index: SafeUint | -1) => boolean,
): DropInitialValueOperator<A, A>;
export function filter<A>(
  predicate: (value: A, index: SafeUint | -1) => boolean,
): DropInitialValueOperator<A, A> {
  return (parentObservable) =>
    new FilterObservableClass(parentObservable, predicate);
}

class FilterObservableClass<A>
  extends SyncChildObservableClass<A, readonly [A]>
  implements FilterOperatorObservable<A>
{
  readonly #predicate: (x: A, index: SafeUint | -1) => boolean;
  #mut_index: SafeUint | -1;

  constructor(
    parentObservable: Observable<A>,
    predicate: (x: A, index: SafeUint | -1) => boolean,
  ) {
    super({
      parents: [parentObservable],
      initialValue: pipe(parentObservable.getSnapshot()).chain((sn) =>
        Maybe.isNone(sn)
          ? Maybe.none
          : predicate(sn.value, -1)
            ? sn
            : Maybe.none,
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

    if (this.#predicate(sn.value, this.#mut_index)) {
      this.setNext(sn.value, updaterSymbol);
    }
  }
}

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

  {
    const s: Observable<number> = source<number>();
    const _d1 = s.chain(filter((x) => x % 2 === 0));

    expectType<typeof _d1, Observable<number>>('=');
  }

  {
    const s = source<number>();
    const m: InitializedObservable<number> = s.chain(setInitialValue(0));
    const _d = m.chain(filter((x) => x % 2 === 0));

    expectType<typeof _d, Observable<number>>('=');
  }
}
