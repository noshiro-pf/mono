import {
  combine,
  derive,
  filter,
  keepEqualParts,
  map,
  pairwise,
  scan,
  skip,
  skipIfNoChange,
  skipUntil,
  skipWhile,
  source,
  state,
  take,
  takeUntil,
  takeWhile,
  withBufferedFrom,
  withCurrentValueFrom,
  withInitialValue,
  zip,
  type InitializedObservable,
  type Observable,
} from 'synstate-next';
import { expectType, isNotUndefined } from 'ts-data-forge';
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

  test('the synchronous operators keep or drop the initial value', () => {
    const s = state(0);

    const e = source<string>();

    const taken = s.pipe(
      take(2),
      takeUntil(e),
      skipIfNoChange(),
      keepEqualParts(),
    );

    expectType<typeof taken, InitializedObservable<number>>('=');

    const _skipped = s.pipe(skip(1));

    expectType<typeof _skipped, Observable<number>>('=');

    const _whiles = s.pipe(
      takeWhile((x) => x > 0),
      skipWhile((x) => x > 0),
    );

    expectType<typeof _whiles, Observable<number>>('=');

    const _untilGo = s.pipe(skipUntil(e));

    expectType<typeof _untilGo, Observable<number>>('=');

    const _pairs = s.pipe(pairwise());

    expectType<typeof _pairs, Observable<FixedLengthTuple<2, number>>>('=');

    const _withCurrent = s.pipe(withCurrentValueFrom(s));

    expectType<typeof _withCurrent, Observable<FixedLengthTuple<2, number>>>(
      '=',
    );

    const _buffered = s.pipe(withBufferedFrom(e));

    expectType<
      typeof _buffered,
      InitializedObservable<readonly [number, readonly string[]]>
    >('=');

    const _zipped = zip([s, s.pipe(map(String))]);

    expectType<
      typeof _zipped,
      InitializedObservable<readonly [number, string]>
    >('=');

    const _zippedEvents = zip([s, e]);

    expectType<typeof _zippedEvents, Observable<readonly [number, string]>>(
      '=',
    );

    assert.isTrue(taken.hasValue);
  });

  test('filter narrows the values by a type guard', () => {
    const s = state<number | undefined>(0);

    const narrowed = s.pipe(filter(isNotUndefined));

    expectType<typeof narrowed, Observable<number>>('=');

    assert.strictEqual(narrowed.peek(), 0);

    const _kept = s.pipe(filter((x) => x !== 0));

    expectType<typeof _kept, Observable<number | undefined>>('=');
  });
});
