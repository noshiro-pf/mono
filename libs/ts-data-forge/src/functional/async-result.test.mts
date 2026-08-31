import { AsyncResult as AsyncResultFromEntryPoint } from '../entry-point.mjs';
import { expectType } from '../expect-type.mjs';
import { AsyncResult } from './async-result/index.mjs';
import { Result } from './result/index.mjs';

// Fixtures are created through functions so that the success/error types stay
// unions instead of being narrowed to literal types by const inference.
const okFixture = (value: number): AsyncResult<number, string> =>
  Promise.resolve(Result.ok(value));

const errFixture = (message: string): AsyncResult<number, string> =>
  Promise.resolve(Result.err(message));

describe('AsyncResult test', () => {
  describe('fromPromise', () => {
    test('resolved promise becomes Ok', async () => {
      const result = await AsyncResult.fromPromise(
        Promise.resolve(42),
        (error) => `mapped: ${String(error)}`,
      );

      assert.isTrue(Result.isOk(result));

      assert.deepStrictEqual(result, Result.ok(42));
    });

    test('rejected promise becomes Err with mapError applied', async () => {
      const result = await AsyncResult.fromPromise(
        Promise.reject(new Error('boom')),
        (error) => (Error.isError(error) ? error.message : 'unknown'),
      );

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(result, Result.err('boom'));
    });

    test('resolved promise becomes Ok when mapError is omitted', async () => {
      const result = await AsyncResult.fromPromise(Promise.resolve(42));

      assert.deepStrictEqual(result, Result.ok(42));

      expectType<typeof result, Result<number, unknown>>('=');
    });

    test('rejection reason is carried as-is when mapError is omitted', async () => {
      const error = new Error('boom');

      const result = await AsyncResult.fromPromise(
        Promise.reject(error).then(() => 42),
      );

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(result, Result.err(error));
    });
  });

  describe('fromThrowable', () => {
    test('resolved async function becomes Ok', async () => {
      const result = await AsyncResult.fromThrowable(
        () => Promise.resolve('data'),
        (error) => `mapped: ${String(error)}`,
      );

      assert.isTrue(Result.isOk(result));

      assert.deepStrictEqual(result, Result.ok('data'));
    });

    test('synchronous throw becomes Err with mapError applied', async () => {
      const result = await AsyncResult.fromThrowable(
        (): Promise<number> => {
          throw new Error('sync failure');
        },
        (error) => (Error.isError(error) ? error.message : 'unknown'),
      );

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(result, Result.err('sync failure'));
    });

    test('async rejection becomes Err with mapError applied', async () => {
      const result = await AsyncResult.fromThrowable(
        () => Promise.reject(new Error('async failure')),
        (error) => (Error.isError(error) ? error.message : 'unknown'),
      );

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(result, Result.err('async failure'));
    });

    test('synchronous throw is carried as-is when mapError is omitted', async () => {
      const error = new Error('sync failure');

      const result = await AsyncResult.fromThrowable((): Promise<number> => {
        throw error;
      });

      assert.deepStrictEqual(result, Result.err(error));

      expectType<typeof result, Result<number, unknown>>('=');
    });

    test('async rejection is carried as-is when mapError is omitted', async () => {
      const error = new Error('async failure');

      const result = await AsyncResult.fromThrowable(() =>
        Promise.reject(error).then(() => 42),
      );

      assert.deepStrictEqual(result, Result.err(error));
    });
  });

  describe('map', () => {
    test('maps Ok value with a synchronous function', async () => {
      const result = await AsyncResult.map(okFixture(5), (value) => value * 2);

      assert.deepStrictEqual(result, Result.ok(10));
    });

    test('maps Ok value with an asynchronous function', async () => {
      const result = await AsyncResult.map(okFixture(5), (value) =>
        Promise.resolve(value * 3),
      );

      assert.deepStrictEqual(result, Result.ok(15));
    });

    test('passes Err through unchanged', async () => {
      let mut_called = false;

      const result = await AsyncResult.map(errFixture('failure'), (value) => {
        mut_called = true;

        return value * 2;
      });

      assert.deepStrictEqual(result, Result.err('failure'));

      assert.isFalse(mut_called);
    });

    test('curried version maps Ok value', async () => {
      const double = AsyncResult.map((value: number) => value * 2);

      const result = await double(okFixture(21));

      assert.deepStrictEqual(result, Result.ok(42));
    });

    test('curried version passes Err through unchanged', async () => {
      const double = AsyncResult.map((value: number) => value * 2);

      const result = await double(errFixture('failure'));

      assert.deepStrictEqual(result, Result.err('failure'));
    });
  });

  describe('mapErr', () => {
    test('maps Err value with a synchronous function', async () => {
      const result = await AsyncResult.mapErr(errFixture('failure'), (error) =>
        error.toUpperCase(),
      );

      assert.deepStrictEqual(result, Result.err('FAILURE'));
    });

    test('maps Err value with an asynchronous function', async () => {
      const result = await AsyncResult.mapErr(
        errFixture('failure'),
        (message) => Promise.resolve(message.length),
      );

      assert.deepStrictEqual(result, Result.err(7));
    });

    test('passes Ok through unchanged', async () => {
      let mut_called = false;

      const result = await AsyncResult.mapErr(okFixture(1), (error) => {
        mut_called = true;

        return error.toUpperCase();
      });

      assert.deepStrictEqual(result, Result.ok(1));

      assert.isFalse(mut_called);
    });

    test('curried version maps Err value', async () => {
      const upper = AsyncResult.mapErr((error: string) => error.toUpperCase());

      const result = await upper(errFixture('failure'));

      assert.deepStrictEqual(result, Result.err('FAILURE'));
    });
  });

  describe('flatMap', () => {
    test('chains with a function returning a Result', async () => {
      const result = await AsyncResult.flatMap(okFixture(4), (value) =>
        value > 0 ? Result.ok(value * 10) : Result.err('non-positive'),
      );

      assert.deepStrictEqual(result, Result.ok(40));
    });

    test('chains with a function returning an AsyncResult', async () => {
      const result = await AsyncResult.flatMap(okFixture(4), (value) =>
        AsyncResult.fromPromise(Promise.resolve(value + 1), () => 'failed'),
      );

      assert.deepStrictEqual(result, Result.ok(5));
    });

    test('chains into Err returned by the function', async () => {
      const result = await AsyncResult.flatMap(
        okFixture(-1),
        (value): Result<number, string> =>
          value > 0 ? Result.ok(value * 10) : Result.err('non-positive'),
      );

      assert.deepStrictEqual(result, Result.err('non-positive'));
    });

    test('short-circuits on Err without calling the function', async () => {
      let mut_called = false;

      const result = await AsyncResult.flatMap(
        errFixture('failure'),
        (value) => {
          mut_called = true;

          return Result.ok(value * 2);
        },
      );

      assert.deepStrictEqual(result, Result.err('failure'));

      assert.isFalse(mut_called);
    });

    test('curried version chains with a function returning a Result', async () => {
      const validate = AsyncResult.flatMap(
        (value: number): Result<number, string> =>
          value > 0 ? Result.ok(value) : Result.err('non-positive'),
      );

      const passed = await validate(okFixture(7));

      const failed = await validate(okFixture(-7));

      assert.deepStrictEqual(passed, Result.ok(7));

      assert.deepStrictEqual(failed, Result.err('non-positive'));
    });
  });

  describe('unwrapOr', () => {
    test('returns the success value for Ok', async () => {
      const value = await AsyncResult.unwrapOr(okFixture(10), 0);

      expect(value).toBe(10);
    });

    test('returns the default value for Err', async () => {
      const value = await AsyncResult.unwrapOr(errFixture('failure'), 0);

      expect(value).toBe(0);
    });
  });

  describe('entry point', () => {
    test('AsyncResult is exported from the package entry point', async () => {
      const result = await AsyncResultFromEntryPoint.fromPromise(
        Promise.resolve(1),
        () => 'failed',
      );

      assert.deepStrictEqual(result, Result.ok(1));
    });
  });
});
