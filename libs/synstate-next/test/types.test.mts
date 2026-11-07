import {
  combine,
  derive,
  filter,
  map,
  scan,
  source,
  state,
  withInitialValue,
  type InitializedObservable,
  type Observable,
} from 'synstate-next';
import { expectType } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';

describe('types', () => {
  test('pipe keeps, drops or provides the initial value', () => {
    const s = state(0);

    const e = source<number>();

    const kept = s.pipe(map((x) => x + 1));

    expectType<typeof kept, InitializedObservable<number>>('=');

    const _dropped = s.pipe(
      map((x) => x + 1),
      filter((x) => x > 0),
    );

    expectType<typeof _dropped, Observable<number>>('=');

    const _provided = e.pipe(
      filter((x) => x > 0),
      scan((acc: number, x) => acc + x, 0),
    );

    expectType<typeof _provided, InitializedObservable<number>>('=');

    const notYet = e.pipe(map((x) => x.toString()));

    expectType<typeof notYet, Observable<string>>('=');

    const _withInitial = e.pipe(withInitialValue(undefined));

    expectType<typeof _withInitial, InitializedObservable<number | undefined>>(
      '=',
    );

    const _both = derive([s, kept], (x, y) => x + y);

    expectType<typeof _both, InitializedObservable<number>>('=');

    const _partial = combine([s, e]);

    expectType<typeof _partial, Observable<FixedLengthTuple<2, number>>>('=');

    // Covariant: a narrower observable goes where a wider one is expected.
    const wide: Observable<number | string> = kept;

    assert.strictEqual(wide.peek(), 1);

    assert.isTrue(kept.hasValue);

    assert.isFalse(notYet.hasValue);

    assert.isUndefined(notYet.peek());
  });
});
