import type { Err, Ok } from '../adt-types.mjs';
import { expectType } from '../expect-type.mjs';
import {
  AsyncData,
  type AsyncErr,
  type AsyncIdle,
  type AsyncPending,
} from './async-data/index.mjs';
import { Optional } from './optional/index.mjs';
import { pipe } from './pipe.mjs';
import { Result } from './result/index.mjs';

/** An annotated `const` would narrow the value back to its own variant. */
const widen = (data: AsyncData<number, string>): AsyncData<number, string> =>
  data;

describe('AsyncData test', () => {
  describe('constructors', () => {
    test('idle', () => {
      const data = AsyncData.idle;

      assert.isTrue(AsyncData.isIdle(data));

      expectType<typeof data, AsyncIdle>('=');

      expectType<AsyncIdle, AsyncData<number, string>>('<=');
    });

    test('pending without previous data', () => {
      const data = AsyncData.pending();

      assert.isTrue(AsyncData.isPending(data));

      assert.deepStrictEqual(data.previous, Optional.none);

      expectType<typeof data, AsyncPending<never>>('=');

      expectType<typeof data, AsyncData<number, string>>('<=');
    });

    test('pending with previous data', () => {
      const data = AsyncData.pending(Optional.some(1));

      assert.deepStrictEqual(data.previous, Optional.some(1));

      expectType<typeof data, AsyncData<number, string>>('<=');
    });

    test('ok is the Ok of Result', () => {
      const data = AsyncData.ok(1);

      assert.deepStrictEqual(data, Result.ok(1));

      expectType<typeof data, Ok<1>>('=');

      expectType<typeof data, AsyncData<number, string>>('<=');
    });

    test('err without previous data', () => {
      const data = AsyncData.err('boom');

      assert.isTrue(Result.isErr(data));

      assert.strictEqual(data.value, 'boom');

      assert.deepStrictEqual(data.previous, Optional.none);

      expectType<typeof data, AsyncErr<never, 'boom'>>('=');

      expectType<typeof data, AsyncData<number, string>>('<=');
    });

    test('err with previous data', () => {
      const data = AsyncData.err('boom', Optional.some(1));

      assert.deepStrictEqual(data.previous, Optional.some(1));

      expectType<typeof data, AsyncData<number, string>>('<=');
    });

    test('an err is still an Err of Result', () => {
      expectType<AsyncErr<number, string>, Err<string>>('<=');

      expectType<Err<string>, AsyncData<number, string>>('!<=');
    });
  });

  describe('type guards', () => {
    const idle = widen(AsyncData.idle);

    const pending = widen(AsyncData.pending(Optional.some(1)));

    const ok = widen(AsyncData.ok(2));

    const err = widen(AsyncData.err('boom', Optional.some(1)));

    test.each([
      ['idle', idle, [true, false, false, false, false]],
      ['pending', pending, [false, true, false, false, false]],
      ['ok', ok, [false, false, true, true, false]],
      ['err', err, [false, false, true, false, true]],
    ] as const)('%s', (_, data, expected) => {
      assert.deepStrictEqual<readonly boolean[]>(
        [
          AsyncData.isIdle(data),
          AsyncData.isPending(data),
          AsyncData.isSettled(data),
          AsyncData.isOk(data),
          AsyncData.isErr(data),
        ],
        expected,
      );
    });

    test('isSettled narrows to a Result', () => {
      assert.isTrue(AsyncData.isSettled(ok));

      if (!AsyncData.isSettled(ok)) {
        return;
      }

      expectType<typeof ok, Ok<number> | AsyncErr<number, string>>('=');

      assert.isTrue(Result.isOk(ok));

      assert.deepStrictEqual(
        Result.map(ok, (n) => n * 10),
        Result.ok(20),
      );
    });

    test('isPending narrows to AsyncPending', () => {
      assert.isTrue(AsyncData.isPending(pending));

      if (!AsyncData.isPending(pending)) {
        return;
      }

      expectType<typeof pending, AsyncPending<number>>('=');

      assert.deepStrictEqual(pending.previous, Optional.some(1));
    });

    test('isErr narrows to AsyncErr', () => {
      assert.isTrue(AsyncData.isErr(err));

      if (!AsyncData.isErr(err)) {
        return;
      }

      expectType<typeof err, AsyncErr<number, string>>('=');

      assert.strictEqual(err.value, 'boom');
    });

    test('isAsyncData', () => {
      for (const data of [idle, pending, ok, err]) {
        assert.isTrue(AsyncData.isAsyncData(data));
      }

      assert.isFalse(AsyncData.isAsyncData(Result.err('boom')));

      assert.isFalse(AsyncData.isAsyncData(Optional.none));

      assert.isFalse(AsyncData.isAsyncData(undefined));

      assert.isFalse(AsyncData.isAsyncData({ $$tag: 'other' }));

      assert.isFalse(
        AsyncData.isAsyncData({
          $$tag: 'ts-data-forge::AsyncData.pending',
          previous: 1,
        }),
      );
    });
  });

  describe('map', () => {
    const double = (n: number): number => n * 2;

    test('maps the value and every previous value', () => {
      assert.deepStrictEqual(
        AsyncData.map(AsyncData.idle, double),
        AsyncData.idle,
      );

      assert.deepStrictEqual(
        AsyncData.map(AsyncData.pending(Optional.some(1)), double),
        AsyncData.pending(Optional.some(2)),
      );

      assert.deepStrictEqual(
        AsyncData.map(AsyncData.pending(), double),
        AsyncData.pending(),
      );

      assert.deepStrictEqual(
        AsyncData.map(AsyncData.ok(3), double),
        AsyncData.ok(6),
      );

      assert.deepStrictEqual(
        AsyncData.map(AsyncData.err('boom', Optional.some(4)), double),
        AsyncData.err('boom', Optional.some(8)),
      );
    });

    test('types', () => {
      const data = widen(AsyncData.ok(3));

      const mapped = AsyncData.map(data, String);

      expectType<typeof mapped, AsyncData<string, string>>('=');

      assert.deepStrictEqual(mapped, AsyncData.ok('3'));
    });

    test('curried', () => {
      const data = widen(AsyncData.ok(3));

      const mapped = pipe(data).map(AsyncData.map(double)).value;

      assert.deepStrictEqual(mapped, AsyncData.ok(6));

      expectType<typeof mapped, AsyncData<number, string>>('=');
    });
  });

  describe('mapErr', () => {
    const toLength = (s: string): number => s.length;

    test('maps the error and keeps the previous value', () => {
      assert.deepStrictEqual(
        AsyncData.mapErr(AsyncData.err('boom', Optional.some(1)), toLength),
        AsyncData.err(4, Optional.some(1)),
      );

      for (const data of [
        AsyncData.idle,
        AsyncData.pending(Optional.some(1)),
        AsyncData.ok(1),
      ]) {
        assert.deepStrictEqual(AsyncData.mapErr(data, toLength), data);
      }
    });

    test('types', () => {
      const data = widen(AsyncData.err('boom'));

      const mapped = AsyncData.mapErr(data, toLength);

      expectType<typeof mapped, AsyncData<number, number>>('=');

      assert.deepStrictEqual(mapped, AsyncData.err(4));
    });

    test('curried', () => {
      const data = widen(AsyncData.err('boom'));

      assert.deepStrictEqual(
        pipe(data).map(AsyncData.mapErr(toLength)).value,
        AsyncData.err(4),
      );
    });
  });

  describe('match', () => {
    const describeData = (data: AsyncData<number, string>): string =>
      AsyncData.match(data, {
        idle: () => 'idle',
        pending: (previous) => `pending ${Optional.unwrapOr(previous, '-')}`,
        ok: (value) => `ok ${value}`,
        err: (error, previous) =>
          `err ${error} ${Optional.unwrapOr(previous, '-')}`,
      });

    test.each([
      [AsyncData.idle, 'idle'],
      [AsyncData.pending(), 'pending -'],
      [AsyncData.pending(Optional.some(1)), 'pending 1'],
      [AsyncData.ok(2), 'ok 2'],
      [AsyncData.err('boom'), 'err boom -'],
      [AsyncData.err('boom', Optional.some(1)), 'err boom 1'],
    ] as const)('%o', (data, expected) => {
      assert.strictEqual(describeData(data), expected);
    });

    test('types', () => {
      const data = widen(AsyncData.ok(1));

      const result = AsyncData.match(data, {
        idle: () => 0 as const,
        pending: () => 1 as const,
        ok: (value) => value,
        err: (error) => error,
      });

      expectType<typeof result, number | string>('=');

      assert.strictEqual(result, 1);
    });

    test('curried', () => {
      const toText = AsyncData.match({
        idle: () => 'idle',
        pending: () => 'pending',
        ok: (value: number) => `ok ${value}`,
        err: (error: string) => `err ${error}`,
      });

      assert.strictEqual(toText(AsyncData.ok(1)), 'ok 1');

      assert.strictEqual(toText(AsyncData.err('boom')), 'err boom');
    });
  });

  describe('latestOk', () => {
    test.each([
      [AsyncData.idle, Optional.none],
      [AsyncData.pending(), Optional.none],
      [AsyncData.pending(Optional.some(1)), Optional.some(1)],
      [AsyncData.ok(2), Optional.some(2)],
      [AsyncData.err('boom'), Optional.none],
      [AsyncData.err('boom', Optional.some(1)), Optional.some(1)],
    ] as const)('%o', (data, expected) => {
      assert.deepStrictEqual(AsyncData.latestOk(data), expected);
    });

    test('types', () => {
      const data = widen(AsyncData.ok(1));

      expectType<
        ReturnType<typeof AsyncData.latestOk<number>>,
        Optional<number>
      >('=');

      assert.deepStrictEqual(AsyncData.latestOk(data), Optional.some(1));
    });
  });

  describe('unwrapOk / unwrapOkOr', () => {
    test('only an Ok counts, never a previous value', () => {
      assert.strictEqual(AsyncData.unwrapOk(AsyncData.ok(1)), 1);

      for (const data of [
        AsyncData.idle,
        AsyncData.pending(Optional.some(1)),
        AsyncData.err('boom', Optional.some(1)),
      ]) {
        assert.isUndefined(AsyncData.unwrapOk(data));

        assert.strictEqual(AsyncData.unwrapOkOr(data, 0), 0);
      }

      assert.strictEqual(AsyncData.unwrapOkOr(AsyncData.ok(1), 0), 1);
    });

    test('types', () => {
      const data = widen(AsyncData.ok(1));

      const value = AsyncData.unwrapOk(data);

      expectType<typeof value, number | undefined>('=');

      assert.strictEqual(value, 1);

      const valueOr = AsyncData.unwrapOkOr(data, 'none');

      expectType<typeof valueOr, number | 'none'>('=');

      assert.strictEqual(valueOr, 1);
    });

    test('curried unwrapOkOr', () => {
      const data = widen(AsyncData.pending());

      assert.strictEqual(pipe(data).map(AsyncData.unwrapOkOr(0)).value, 0);
    });
  });

  describe('toResult', () => {
    test('a settled value becomes a plain Result', () => {
      assert.deepStrictEqual(
        AsyncData.toResult(AsyncData.ok(1)),
        Optional.some(Result.ok(1)),
      );

      assert.deepStrictEqual(
        AsyncData.toResult(AsyncData.err('boom', Optional.some(1))),
        Optional.some(Result.err('boom')),
      );

      assert.deepStrictEqual(AsyncData.toResult(AsyncData.idle), Optional.none);

      assert.deepStrictEqual(
        AsyncData.toResult(AsyncData.pending(Optional.some(1))),
        Optional.none,
      );
    });

    test('types', () => {
      const data = widen(AsyncData.ok(1));

      const result = AsyncData.toResult(data);

      expectType<typeof result, Optional<Result<number, string>>>('=');

      assert.deepStrictEqual(result, Optional.some(Result.ok(1)));
    });
  });

  describe('transitions', () => {
    test('toPending keeps the latest Ok as previous', () => {
      assert.deepStrictEqual(
        AsyncData.toPending(AsyncData.idle),
        AsyncData.pending(),
      );

      assert.deepStrictEqual(
        AsyncData.toPending(AsyncData.ok(1)),
        AsyncData.pending(Optional.some(1)),
      );

      assert.deepStrictEqual(
        AsyncData.toPending(AsyncData.err('boom', Optional.some(1))),
        AsyncData.pending(Optional.some(1)),
      );

      assert.deepStrictEqual(
        AsyncData.toPending(AsyncData.pending(Optional.some(1))),
        AsyncData.pending(Optional.some(1)),
      );
    });

    test('settle with Ok replaces everything', () => {
      assert.deepStrictEqual(
        AsyncData.settle(AsyncData.pending(Optional.some(1)), Result.ok(2)),
        AsyncData.ok(2),
      );
    });

    test('settle with Err keeps the latest Ok as previous', () => {
      assert.deepStrictEqual(
        AsyncData.settle(
          AsyncData.pending(Optional.some(1)),
          Result.err('boom'),
        ),
        AsyncData.err('boom', Optional.some(1)),
      );

      assert.deepStrictEqual(
        AsyncData.settle(AsyncData.ok(1), Result.err('boom')),
        AsyncData.err('boom', Optional.some(1)),
      );

      assert.deepStrictEqual(
        AsyncData.settle(AsyncData.idle, Result.err('boom')),
        AsyncData.err('boom'),
      );
    });

    test('a refresh that fails, then succeeds', () => {
      const loaded = widen(AsyncData.ok(1));

      const refreshing = AsyncData.toPending(loaded);

      const failed = AsyncData.settle(refreshing, Result.err('boom'));

      assert.deepStrictEqual(AsyncData.latestOk(failed), Optional.some(1));

      const retrying = AsyncData.toPending(failed);

      assert.deepStrictEqual(AsyncData.latestOk(retrying), Optional.some(1));

      const recovered = AsyncData.settle(retrying, Result.ok(2));

      assert.deepStrictEqual(recovered, AsyncData.ok(2));
    });

    test('types', () => {
      const data = widen(AsyncData.idle);

      const pending = AsyncData.toPending(data);

      expectType<typeof pending, AsyncPending<number>>('=');

      assert.deepStrictEqual(pending, AsyncData.pending());

      const result: Result<number, string> = Result.ok(1);

      const settled = AsyncData.settle(data, result);

      expectType<typeof settled, Ok<number> | AsyncErr<number, string>>('=');

      assert.deepStrictEqual(settled, AsyncData.ok(1));
    });

    test('curried settle', () => {
      const data = widen(AsyncData.pending(Optional.some(1)));

      assert.deepStrictEqual(
        pipe(data).map(AsyncData.settle(Result.err('boom'))).value,
        AsyncData.err('boom', Optional.some(1)),
      );
    });
  });
});
