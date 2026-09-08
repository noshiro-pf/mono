import { expectType } from '../expect-type.mjs';
import { AsyncResult, Result } from '../functional/index.mjs';
import {
  isPanicError,
  panic,
  todo,
  unreachable,
  type PanicError,
} from './panic.mjs';

describe(panic, () => {
  test('throws an Error named PanicError with the message', () => {
    expect(() => panic('boom')).toThrow(Error);

    expect(() => panic('boom')).toThrow('boom');

    try {
      panic('boom');
    } catch (error) {
      assert.isTrue(isPanicError(error));

      assert.isTrue(Error.isError(error));

      assert.strictEqual(error.name, 'PanicError');
    }
  });

  test('attaches the cause', () => {
    const cause = { reason: 'x' } as const;

    try {
      panic('boom', { cause });
    } catch (error) {
      assert.isTrue(isPanicError(error));

      assert.deepStrictEqual(error.cause, cause);
    }
  });

  test('has type never', () => {
    expectType<ReturnType<typeof panic>, never>('=');

    const orPanic = (value: number | undefined): number => value ?? panic('x');

    expectType<ReturnType<typeof orPanic>, number>('=');

    assert.isTrue(orPanic(1) === 1);
  });
});

describe(isPanicError, () => {
  test('is false for a plain Error and for non-errors', () => {
    assert.isFalse(isPanicError(new Error('boom')));

    assert.isFalse(isPanicError('PanicError'));

    assert.isFalse(isPanicError(undefined));
  });
});

describe(todo, () => {
  test('panics with "not implemented"', () => {
    expect(() => todo()).toThrow('not implemented');

    expect(() => todo('parse')).toThrow('not implemented: parse');
  });
});

describe(unreachable, () => {
  test('panics with the stringified value', () => {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    expect(() => unreachable('x' as never)).toThrow(
      'Reached code the types mark unreachable: x',
    );

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    expect(() => unreachable(1 as never, 'custom')).toThrow('custom');
  });
});

const panicErrorBrand: Readonly<{ name: 'PanicError' }> = {
  name: 'PanicError',
} as const;

/** A PanicError built by hand, to reject a Promise with. */
const panicError = (): PanicError =>
  Object.assign(new Error('boom'), panicErrorBrand);

describe('boundary functions rethrow a panic', () => {
  test('Result.fromThrowable', () => {
    expect(() => Result.fromThrowable(() => panic('boom'))).toThrow('boom');

    assert.isTrue(
      Result.isErr(
        Result.fromThrowable(() => {
          throw new Error('recoverable');
        }),
      ),
    );
  });

  test('Result.fromPromise', async () => {
    await expect(
      Result.fromPromise(Promise.reject(panicError())),
    ).rejects.toThrow('boom');

    assert.isTrue(
      Result.isErr(await Result.fromPromise(Promise.reject(new Error('r')))),
    );
  });

  test('AsyncResult.fromThrowable and fromPromise', async () => {
    await expect(
      AsyncResult.fromThrowable(async () => {
        await Promise.resolve();

        panic('boom');
      }),
    ).rejects.toThrow('boom');

    await expect(
      AsyncResult.fromPromise(Promise.reject(panicError()), (e) => e),
    ).rejects.toThrow('boom');

    assert.isTrue(
      Result.isErr(
        await AsyncResult.fromThrowable(() =>
          Promise.reject(new Error('recoverable')),
        ),
      ),
    );
  });

  test('the unwrap functions panic', () => {
    const failing = [
      () => Result.unwrapThrow(Result.err('e')),
      () => Result.expectToBe(Result.err('e'), 'm'),
    ] as const;

    for (const fn of failing) {
      try {
        fn();
      } catch (error) {
        assert.isTrue(isPanicError(error));
      }
    }
  });
});
