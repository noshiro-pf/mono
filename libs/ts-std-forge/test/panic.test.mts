import {
  expectType,
  isPanicError,
  panic,
  Result,
  todo,
  unreachable,
} from '../src/index.mjs';

describe(panic, () => {
  test('throws a PanicError with the message and cause', () => {
    expect(() => panic('boom')).toThrow(Error);

    expect(() => panic('boom')).toThrow('boom');

    const cause = { reason: 'x' } as const;

    try {
      panic('boom', { cause });
    } catch (error) {
      assert.isTrue(isPanicError(error));

      assert.deepStrictEqual(error.cause, cause);
    }
  });

  test('has type never, so it terminates control flow', () => {
    expectType<ReturnType<typeof panic>, never>('=');

    const orPanic = (value: number | undefined): number => value ?? panic('x');

    expectType<ReturnType<typeof orPanic>, number>('=');

    assert.isTrue(orPanic(1) === 1);
  });

  test('is rethrown by Result.fromThrowable', () => {
    expect(() => Result.fromThrowable(() => panic('boom'))).toThrow('boom');
  });

  test('given an error, throws that same error marked as a panic', () => {
    const original = Object.assign(new Error('not found'), {
      name: 'HttpError',
      kind: 'http',
    } as const);

    try {
      panic(original);
    } catch (error) {
      assert.isTrue(Object.is(error, original));

      assert.isTrue(isPanicError(error));

      // The error keeps the identity its factory gave it (Sumi D-27).
      assert.strictEqual(original.name, 'HttpError');
    }

    // And the boundary still refuses to turn it into an Err.
    expect(() => Result.fromThrowable(() => panic(original))).toThrow(
      'not found',
    );
  });
});

describe(todo, () => {
  test('panics with "not implemented"', () => {
    expect(() => todo()).toThrow('not implemented');

    expect(() => todo('parse')).toThrow('not implemented: parse');

    try {
      todo();
    } catch (error) {
      assert.isTrue(isPanicError(error));
    }
  });
});

describe(unreachable, () => {
  test('panics with the stringified value, or the given message', () => {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    expect(() => unreachable('x' as never)).toThrow(
      'Reached code the types mark unreachable: x',
    );

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    expect(() => unreachable(1 as never, 'custom')).toThrow('custom');
  });
});
