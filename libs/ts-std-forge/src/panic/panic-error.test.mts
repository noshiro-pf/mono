import { AsyncResult, Result } from '../functional/index.mjs';
import { createPanicError, isPanicError, markAsPanic } from './panic-error.mjs';

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

describe(markAsPanic, () => {
  test('marks the error in place, keeping its identity and stack', () => {
    const original = Object.assign(new Error('not found'), {
      name: 'HttpError',
      kind: 'http',
      status: 404,
    } as const);

    const stackBefore = original.stack;

    const marked = markAsPanic(original);

    // The same object, so nothing about it is lost. `Object.is` rather than
    // `===` because the two static types no longer overlap once the mark is
    // in the result type.
    assert.isTrue(Object.is(marked, original));

    assert.isTrue(isPanicError(marked));

    assert.strictEqual(marked.name, 'HttpError');

    assert.strictEqual(marked.stack, stackBefore);

    assert.strictEqual(original.status, 404);
  });

  test('wraps a frozen error instead of failing to mark it', () => {
    const frozen = Object.freeze(new Error('frozen'));

    const marked = markAsPanic(frozen);

    assert.isFalse(Object.is(marked, frozen));

    assert.isTrue(isPanicError(marked));

    assert.strictEqual(marked.cause, frozen);
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

  test('an error marked by panic(error) is rethrown too', () => {
    const original = new Error('boom');

    expect(() =>
      Result.fromThrowable(() => {
        throw markAsPanic(original);
      }),
    ).toThrow('boom');
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
