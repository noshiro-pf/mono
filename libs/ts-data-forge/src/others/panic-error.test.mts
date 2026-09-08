import { AsyncResult, Result } from '../functional/index.mjs';
import { createPanicError, isPanicError } from './panic-error.mjs';

describe(createPanicError, () => {
  test('builds an Error named PanicError with the message and cause', () => {
    const error = createPanicError('boom', { cause: 'x' });

    assert.isTrue(Error.isError(error));

    assert.strictEqual(error.name, 'PanicError');

    assert.strictEqual(error.message, 'boom');

    assert.strictEqual(error.cause, 'x');

    assert.isUndefined(createPanicError('boom').cause);
  });
});

describe(isPanicError, () => {
  test('is true for a PanicError, false for a plain Error and non-errors', () => {
    assert.isTrue(isPanicError(createPanicError('boom')));

    assert.isFalse(isPanicError(new Error('boom')));

    assert.isFalse(isPanicError('PanicError'));

    assert.isFalse(isPanicError(undefined));
  });
});

describe('boundary functions rethrow a panic', () => {
  test('Result.fromThrowable', () => {
    expect(() =>
      Result.fromThrowable(() => {
        throw createPanicError('boom');
      }),
    ).toThrow('boom');

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
      Result.fromPromise(Promise.reject(createPanicError('boom'))),
    ).rejects.toThrow('boom');

    assert.isTrue(
      Result.isErr(await Result.fromPromise(Promise.reject(new Error('r')))),
    );
  });

  test('AsyncResult.fromThrowable and fromPromise', async () => {
    await expect(
      AsyncResult.fromThrowable(() => Promise.reject(createPanicError('boom'))),
    ).rejects.toThrow('boom');

    await expect(
      AsyncResult.fromPromise(
        Promise.reject(createPanicError('boom')),
        (e) => e,
      ),
    ).rejects.toThrow('boom');

    assert.isTrue(
      Result.isErr(
        await AsyncResult.fromThrowable(() =>
          Promise.reject(new Error('recoverable')),
        ),
      ),
    );
  });

  test('the unwrap functions throw a PanicError', () => {
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
