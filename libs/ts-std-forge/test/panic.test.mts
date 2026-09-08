import { expectType, isPanicError, Result } from 'ts-data-forge';
import { panic, todo, unreachable } from '../src/index.mjs';

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
