import { expectType } from '../expect-type.mjs';
import { Num } from '../number/index.mjs';
import { type Err, type Ok } from '../types.mjs';
import { Optional } from './optional/index.mjs';
import { pipe } from './pipe.mjs';
import { Result, type UnknownResult } from './result/index.mjs';

describe('Result test', () => {
  describe('ok', () => {
    test('creates Ok result', () => {
      const result = Result.ok(42);

      assert.isTrue(Result.isOk(result));

      assert.isFalse(Result.isErr(result));

      expect(result.value).toBe(42);

      expectType<typeof result, Result<number, never>>('<=');
    });

    test('creates Ok result with string', () => {
      const result = Result.ok('success');

      assert.isTrue(Result.isOk(result));

      expect(result.value).toBe('success');

      expectType<typeof result, Result<string, never>>('<=');
    });
  });

  describe('err', () => {
    test('creates Err result', () => {
      const result = Result.err('error message');

      assert.isTrue(Result.isErr(result));

      assert.isFalse(Result.isOk(result));

      expect(result.value).toBe('error message');

      expectType<typeof result, Result<never, string>>('<=');
    });

    test('creates Err result with number', () => {
      const result = Result.err(404);

      assert.isTrue(Result.isErr(result));

      expect(result.value).toBe(404);

      expectType<typeof result, Result<never, number>>('<=');
    });
  });

  describe('isOk', () => {
    test('type guard for Ok results', () => {
      const result: Result<number, string> = Result.ok(42);

      if (Result.isOk(result)) {
        expectType<typeof result, Ok<number>>('<=');

        expect(result.value).toBe(42);
      }
    });

    test('returns false for Err results', () => {
      const result: Result<number, string> = Result.err('error');

      assert.isFalse(Result.isOk(result));
    });
  });

  describe('isErr', () => {
    test('type guard for Err results', () => {
      const result: Result<number, string> = Result.err('error');

      if (Result.isErr(result)) {
        expectType<typeof result, Err<string>>('<=');

        expect(result.value).toBe('error');
      }
    });

    test('returns false for Ok results', () => {
      const result: Result<number, string> = Result.ok(42);

      assert.isFalse(Result.isErr(result));
    });
  });

  describe('isResult', () => {
    test('recognizes Ok results', () => {
      const result = Result.ok(42);

      assert.isTrue(Result.isResult(result));
    });

    test('recognizes Err results', () => {
      const result = Result.err('error');

      assert.isTrue(Result.isResult(result));
    });

    test('rejects non-Result values', () => {
      assert.isFalse(Result.isResult(42));

      assert.isFalse(Result.isResult('string'));

      assert.isFalse(Result.isResult(null));

      assert.isFalse(Result.isResult(undefined));

      assert.isFalse(Result.isResult({}));

      assert.isFalse(Result.isResult({ type: 'unknown', value: 42 }));
    });
  });

  describe('map', () => {
    test('maps Ok result', () => {
      const result = Result.ok(5);

      const mapped = Result.map(result, (x) => x * 2);

      assert.isTrue(Result.isOk(mapped));

      expect(mapped.value).toBe(10);

      expectType<typeof mapped, Result<number, never>>('<=');
    });

    test('preserves Err result', () => {
      const result: Result<number, string> = Result.err('error');

      const mapped = Result.map(result, (x) => x * 2);

      assert.isTrue(Result.isErr(mapped));

      expect(mapped.value).toBe('error');

      expectType<typeof mapped, Result<number, string>>('<=');
    });

    test('should support curried form', () => {
      const doubler = Result.map((x: number) => x * 2);

      const okResult = Result.ok(5);

      const mapped = doubler(okResult);

      assert.isTrue(Result.isOk(mapped));

      expect(mapped.value).toBe(10);

      const errResult: Result<number, string> = Result.err('error');

      const mappedErr = doubler(errResult);

      assert.isTrue(Result.isErr(mappedErr));

      expect(mappedErr.value).toBe('error');
    });

    test('should work with pipe when curried', () => {
      const doubler = Result.map((x: number) => x * 2);

      const toStringFn = Result.map((x: number) => x.toString());

      const result = pipe(Result.ok(5)).map(doubler).map(toStringFn).value;

      assert.isTrue(Result.isOk(result));

      expect(result.value).toBe('10');
    });

    test('curried form is usable from a caller generic over the result', () => {
      // The motivating case: with the curried parameter fixed to
      // `Result<S, E>`, `S` binds to `Result.UnwrapOk<R>` here and a bare
      // `R extends UnknownResult` is not assignable to that, so this only
      // compiles because the returned function is generic over the whole
      // result.
      const liftMap =
        <R extends UnknownResult, S2>(mapFn: (x: Result.UnwrapOk<R>) => S2) =>
        (result: R): Result<S2, Result.UnwrapErr<R>> =>
          Result.map(mapFn)(result);

      const lengthOf = liftMap<Result<string, 'boom'>, number>((s) => s.length);

      const mapped = lengthOf(Result.ok('abc'));

      expectType<typeof mapped, Result<number, 'boom'>>('=');

      assert.deepStrictEqual(mapped, Result.ok(3));

      assert.deepStrictEqual(lengthOf(Result.err('boom')), Result.err('boom'));
    });

    test('curried form keeps the error type and rejects a mismatch', () => {
      const mapToLength = Result.map((text: string) => text.length);

      const mapped = mapToLength(Result.ok('abc'));

      expectType<typeof mapped, Result<number, never>>('=');

      assert.deepStrictEqual(mapped, Result.ok(3));

      const failed = mapToLength(Result.err('boom' as const));

      expectType<typeof failed, Result<number, 'boom'>>('=');

      assert.deepStrictEqual(failed, Result.err('boom'));

      // @ts-expect-error a Result<number, …> is not a Result<string, …>
      const rejected = (): unknown => mapToLength(Result.ok(42));

      expect(rejected).toBeTypeOf('function');
    });
  });

  describe('mapErr', () => {
    test('maps Err result', () => {
      const result: Result<number, string> = Result.err('error');

      const mapped = Result.mapErr(result, (e) => e.toUpperCase());

      assert.isTrue(Result.isErr(mapped));

      expect(mapped.value).toBe('ERROR');

      expectType<typeof mapped, Result<number, string>>('<=');
    });

    test('preserves Ok result', () => {
      const result: Result<number, string> = Result.ok(42);

      const mapped = Result.mapErr(result, (e: string) => e.toUpperCase());

      assert.isTrue(Result.isOk(mapped));

      expect(mapped.value).toBe(42);

      expectType<typeof mapped, Ok<number>>('=');
    });

    test('should support curried form', () => {
      const errorUppercase = Result.mapErr((e: string) => e.toUpperCase());

      const errResult: Result<number, string> = Result.err('error');

      const mapped = errorUppercase(errResult);

      assert.isTrue(Result.isErr(mapped));

      expect(mapped.value).toBe('ERROR');

      const okResult: Result<number, string> = Result.ok(42);

      const mappedOk = errorUppercase(okResult);

      assert.isTrue(Result.isOk(mappedOk));

      expect(mappedOk.value).toBe(42);
    });

    test('should work with pipe when curried', () => {
      const errorUppercase = Result.mapErr((e: string) => e.toUpperCase());

      const errorPrefix = Result.mapErr((e: string) => `ERROR: ${e}`);

      const result = pipe(Result.err('failed'))
        .map(errorUppercase)
        .map(errorPrefix).value;

      assert.isTrue(Result.isErr(result));

      expect(result.value).toBe('ERROR: FAILED');
    });

    test('curried form is usable from a caller generic over the result', () => {
      const liftMapErr =
        <R extends UnknownResult, E2>(mapFn: (x: Result.UnwrapErr<R>) => E2) =>
        (result: R): Result<Result.UnwrapOk<R>, E2> =>
          Result.mapErr(mapFn)(result);

      const shout = liftMapErr<Result<number, string>, string>((e) =>
        e.toUpperCase(),
      );

      const mapped = shout(Result.err('failed'));

      expectType<typeof mapped, Result<number, string>>('=');

      assert.deepStrictEqual(mapped, Result.err('FAILED'));

      assert.deepStrictEqual(shout(Result.ok(1)), Result.ok(1));
    });

    test('curried form keeps the ok type and rejects a mismatch', () => {
      const shout = Result.mapErr((e: string) => e.toUpperCase());

      const mapped = shout(Result.err('failed'));

      expectType<typeof mapped, Result<never, string>>('=');

      assert.deepStrictEqual(mapped, Result.err('FAILED'));

      // @ts-expect-error a Result<…, number> is not a Result<…, string>
      const rejected = (): unknown => shout(Result.err(42));

      expect(rejected).toBeTypeOf('function');
    });
  });

  describe('unwrapThrow', () => {
    test('unwraps Ok result', () => {
      const result = Result.ok(42);

      const value = Result.unwrapThrow(result);

      expect(value).toBe(42);

      expectType<typeof value, number>('<=');
    });

    test('throws on Err result', () => {
      const result = Result.err('error message');

      expect(() => Result.unwrapThrow(result)).toThrow('error message');
    });
  });

  describe('unwrapOkOr', () => {
    test('unwraps Ok result', () => {
      const result = Result.ok(42);

      const value = Result.unwrapOkOr(result, 0);

      expect(value).toBe(42);

      expectType<typeof value, number>('<=');
    });

    test('returns default for Err result', () => {
      const result: Result<number, string> = Result.err('error');

      const value = Result.unwrapOkOr(result, 0);

      expect(value).toBe(0);

      expectType<typeof value, number>('<=');
    });

    test('should support curried form', () => {
      const unwrapWithDefault = Result.unwrapOkOr(42);

      const okResult = Result.ok(100);

      const successValue = unwrapWithDefault(okResult);

      expect(successValue).toBe(100);

      const errResult: Result<number, string> = Result.err('failed');

      const defaultValue = unwrapWithDefault(errResult);

      expect(defaultValue).toBe(42);
    });

    test('should work with pipe when curried', () => {
      const unwrapWithDefault = Result.unwrapOkOr(0);

      const successResult = pipe(Result.ok(200)).map(unwrapWithDefault).value;

      expect(successResult).toBe(200);

      const errorResult = pipe(Result.err('computation failed')).map(
        unwrapWithDefault,
      ).value;

      expect(errorResult).toBe(0);
    });
  });

  describe('unwrapErr', () => {
    test('unwraps Err result', () => {
      const result: Result<number, string> = Result.err('error');

      const value = Result.unwrapErr(result);

      expect(value).toBe('error');

      expectType<typeof value, string | undefined>('<=');
    });

    test('returns undefined for Ok result', () => {
      const result: Result<number, string> = Result.ok(42);

      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      const value = Result.unwrapErr(result);

      expect(value).toBeUndefined();

      expectType<typeof value, string | undefined>('<=');
    });
  });

  describe('fold', () => {
    test('folds Ok result', () => {
      const result = Result.ok(42);

      const folded = Result.fold(
        result,
        (x) => x * 2,
        () => 0,
      );

      assert.isTrue(Result.isOk(folded));

      expect(folded.value).toBe(84);

      expectType<typeof folded, Ok<number>>('=');
    });

    test('folds Err result', () => {
      const result: Result<number, string> = Result.err('error');

      const folded = Result.fold(
        result,
        (x) => x * 2,
        (e) => e.length,
      );

      assert.isTrue(Result.isErr(folded));

      expect(folded.value).toBe(5); // length of 'error'

      expectType<typeof folded, Err<number>>('=');
    });

    test('should support curried form', () => {
      const folder = Result.fold(
        (x: number) => x * 2,
        (e: string) => e.length,
      );

      const okResult = Result.ok(42);

      const foldedOk = folder(okResult);

      assert.isTrue(Result.isOk(foldedOk));

      expect(foldedOk.value).toBe(84);

      const errResult: Result<number, string> = Result.err('error');

      const foldedErr = folder(errResult);

      assert.isTrue(Result.isErr(foldedErr));

      expect(foldedErr.value).toBe(5);
    });

    test('should work with pipe when curried', () => {
      const folder = Result.fold(
        (x: number) => x * 2,
        () => 0,
      );

      const result = pipe(Result.ok(21)).map(folder).value;

      assert.isTrue(Result.isOk(result));

      expect(result.value).toBe(42);

      const errorResult = pipe(Result.err('error')).map(folder).value;

      assert.isTrue(Result.isErr(errorResult));

      expect(errorResult.value).toBe(0);
    });
  });

  describe('fromPromise', () => {
    test('handles async functions that resolve', async () => {
      const asyncFn = async (): Promise<number> => {
        await Promise.resolve();

        return 42;
      };

      const result = await Result.fromPromise(asyncFn());

      assert.isTrue(Result.isOk(result));

      expect(Result.unwrapOk(result)).toBe(42);
    });

    test('handles async functions that reject', async () => {
      const error = new Error('Async error');

      const asyncFn = async (): Promise<number> =>
        Promise.reject(error).then(() => 42);

      const result = await Result.fromPromise(asyncFn());

      assert.isTrue(Result.isErr(result));

      expect(Result.unwrapErr(result)).toBe(error);
    });

    test('works with different promise types', async () => {
      const stringPromise = Promise.resolve('hello');

      const result = await Result.fromPromise(stringPromise);

      expect(Result.unwrapOk(result)).toBe('hello');

      expectType<typeof result, Result<string, unknown>>('=');
    });
  });

  describe('flatMap', () => {
    test('should chain operations that return Result', () => {
      const divide = (a: number, b: number): Result<number, string> =>
        b === 0
          ? Result.err('Division by zero')
          : // eslint-disable-next-line total-functions/no-partial-division
            Result.ok(a / b);

      const result = Result.flatMap(Result.ok(10), (x) => divide(x, 2));

      expect(Result.unwrapOk(result)).toBe(5);

      const error = Result.flatMap(Result.ok(10), (x) => divide(x, 0));

      expect(Result.unwrapErr(error)).toBe('Division by zero');
    });

    test('should return Err if input is Err', () => {
      const result = Result.flatMap(Result.err('initial error'), (_: never) =>
        Result.ok(42),
      );

      expect(Result.unwrapErr(result)).toBe('initial error');
    });

    test('should support chaining multiple flatMaps', () => {
      const parseNumber = (s: string): Result<number, string> => {
        const n = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);

        return Number.isNaN(n) ? Result.err('Not a number') : Result.ok(n);
      };

      const divide = (a: number, b: number): Result<number, string> =>
        // eslint-disable-next-line total-functions/no-partial-division
        b === 0 ? Result.err('Division by zero') : Result.ok(a / b);

      const result = Result.flatMap(
        Result.flatMap(parseNumber('100'), (x) => divide(x, 2)),
        (x) => Result.ok(x + 10),
      );

      expect(Result.unwrapOk(result)).toBe(60);
    });

    test('should support curried form', () => {
      const divide = (a: number, b: number): Result<number, string> =>
        b === 0
          ? Result.err('Division by zero')
          : // eslint-disable-next-line total-functions/no-partial-division
            Result.ok(a / b);

      const divideBy2 = Result.flatMap((x: number) => divide(x, 2));

      const okResult = Result.ok(10);

      const result = divideBy2(okResult);

      assert.isTrue(Result.isOk(result));

      expect(result.value).toBe(5);

      const divideByZero = Result.flatMap((x: number) => divide(x, 0));

      const errorResult = divideByZero(Result.ok(10));

      assert.isTrue(Result.isErr(errorResult));

      expect(errorResult.value).toBe('Division by zero');

      const initialError = divideBy2(Result.err('initial error'));

      assert.isTrue(Result.isErr(initialError));

      expect(initialError.value).toBe('initial error');
    });

    test('should work with pipe when curried', () => {
      const parseNumber = (s: string): Result<number, string> => {
        const n = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);

        return Number.isNaN(n) ? Result.err('Not a number') : Result.ok(n);
      };

      const doubleIfPositive = (n: number): Result<number, string> =>
        n > 0 ? Result.ok(n * 2) : Result.err('Not positive');

      const parser = Result.flatMap(parseNumber);

      const doubler = Result.flatMap(doubleIfPositive);

      const result = pipe(Result.ok('42')).map(parser).map(doubler).value;

      assert.isTrue(Result.isOk(result));

      expect(result.value).toBe(84);
    });
  });

  describe('swap', () => {
    test('should swap Ok to Err', () => {
      const okResult = Result.ok(42);

      const swapped = Result.swap(okResult);

      assert.isTrue(Result.isErr(swapped));

      expect(Result.unwrapErr(swapped)).toBe(42);
    });

    test('should swap Err to Ok', () => {
      const errResult = Result.err('error');

      const swapped = Result.swap(errResult);

      assert.isTrue(Result.isOk(swapped));

      expect(Result.unwrapOk(swapped)).toBe('error');
    });
  });

  describe('toOptional', () => {
    test('should convert Ok to Some-like', () => {
      const okResult = Result.ok(42);

      const optional = Result.toOptional(okResult);

      assert.isTrue(Optional.isSome(optional));

      expect(Optional.unwrapThrow(optional)).toBe(42);
    });

    test('should convert Err to None-like', () => {
      const errResult = Result.err('error');

      const optional = Result.toOptional(errResult);

      assert.isTrue(Optional.isNone(optional));
    });
  });

  describe('unwrapErrThrow', () => {
    test('should return error value for Err', () => {
      const result = Result.err('error message');

      expect(Result.unwrapErrThrow(result)).toBe('error message');
    });

    test('should throw for Ok', () => {
      const result = Result.ok(42);

      expect(() => Result.unwrapErrThrow(result)).toThrow(
        'Expected Err but got Ok: 42',
      );
    });

    test('should use custom toString function', () => {
      const result = Result.ok({ id: 1, name: 'test' });

      expect(() =>
        Result.unwrapErrThrow(result, (obj) => `Object(id=${obj.id})`),
      ).toThrow('Expected Err but got Ok: Object(id=1)');
    });
  });

  describe('unwrapErrOr', () => {
    test('should return error value for Err result', () => {
      const result = Result.err('error message');

      const value = Result.unwrapErrOr(result, 'default');

      expect(value).toBe('error message');
    });

    test('should return default value for Ok result', () => {
      const result = Result.ok(42);

      const value = Result.unwrapErrOr(result, 'default');

      expect(value).toBe('default');
    });

    test('should support curried form', () => {
      const unwrapErrorWithDefault = Result.unwrapErrOr('unknown error');

      const errResult: Result<number, string> = Result.err('failed');

      const errorValue = unwrapErrorWithDefault(errResult);

      expect(errorValue).toBe('failed');

      const okResult: Result<number, string> = Result.ok(42);

      const defaultValue = unwrapErrorWithDefault(okResult);

      expect(defaultValue).toBe('unknown error');
    });

    test('should work with pipe when curried', () => {
      const unwrapErrorWithDefault = Result.unwrapErrOr('unknown error');

      const errorResult = pipe(Result.err('network failure')).map(
        unwrapErrorWithDefault,
      ).value;

      expect(errorResult).toBe('network failure');

      const okResult = pipe(Result.ok('success')).map(
        unwrapErrorWithDefault,
      ).value;

      expect(okResult).toBe('unknown error');
    });
  });

  describe('expectToBe', () => {
    test('should return value for Ok result', () => {
      const result = Result.ok(42);

      const value = Result.expectToBe(result, 'Expected valid number');

      expect(value).toBe(42);
    });

    test('should throw custom error for Err result', () => {
      const result = Result.err('failed');

      expect(() => Result.expectToBe(result, 'Operation must succeed')).toThrow(
        'Operation must succeed',
      );
    });

    test('should support curried form', () => {
      const mustBeOk = Result.expectToBe('Expected successful result');

      const okResult = Result.ok('success');

      const value = mustBeOk(okResult);

      expect(value).toBe('success');

      const errResult: Result<string, string> = Result.err('failed');

      expect(() => mustBeOk(errResult)).toThrow('Expected successful result');
    });

    test('should work with pipe when curried', () => {
      const mustBeOk = Result.expectToBe('Validation failed');

      const successResult = pipe(Result.ok(100)).map(mustBeOk).value;

      expect(successResult).toBe(100);

      expect(
        () => pipe(Result.err('validation error')).map(mustBeOk).value,
      ).toThrow('Validation failed');
    });
  });

  describe('orElse', () => {
    test('should return the first Result if it is Ok', () => {
      const primary = Result.ok(42);

      const fallback = Result.ok(100);

      const result = Result.orElse(primary, fallback);

      expect(Result.unwrapOk(result)).toBe(42);
    });

    test('should return the alternative if the first is Err', () => {
      const primary = Result.err('error');

      const fallback = Result.ok('default');

      const result = Result.orElse(primary, fallback);

      expect(Result.unwrapOk(result)).toBe('default');
    });

    test('should return Err if both are Err', () => {
      const primary = Result.err('error1');

      const fallback = Result.err('error2');

      const result = Result.orElse(primary, fallback);

      expect(Result.unwrapErr(result)).toBe('error2');
    });

    test('should support curried form', () => {
      const fallbackTo = Result.orElse(Result.ok('fallback'));

      const okResult = Result.ok('primary');

      const result = fallbackTo(okResult);

      assert.isTrue(Result.isOk(result));

      expect(result.value).toBe('primary');

      const errResult: Result<string, string> = Result.err('failed');

      const fallbackResult = fallbackTo(errResult);

      assert.isTrue(Result.isOk(fallbackResult));

      expect(fallbackResult.value).toBe('fallback');
    });

    test('should work with pipe when curried', () => {
      const fallbackTo = Result.orElse(Result.ok('backup'));

      const okResult = pipe(Result.ok('original')).map(fallbackTo).value;

      assert.isTrue(Result.isOk(okResult));

      expect(okResult.value).toBe('original');

      const errResult = pipe(Result.err('network error')).map(fallbackTo).value;

      assert.isTrue(Result.isOk(errResult));

      expect(errResult.value).toBe('backup');
    });
  });

  describe('zip', () => {
    test('should combine two Ok values into a tuple', () => {
      const a = Result.ok(1);

      const b = Result.ok('hello');

      const zipped = Result.zip(a, b);

      assert.deepStrictEqual(Result.unwrapOk(zipped), [1, 'hello']);
    });

    test('should return first Err if first is Err', () => {
      const a = Result.err('error1');

      const b = Result.ok('hello');

      const zipped = Result.zip(a, b);

      expect(Result.unwrapErr(zipped)).toBe('error1');
    });

    test('should return second Err if second is Err', () => {
      const a = Result.ok(1);

      const b = Result.err('error2');

      const zipped = Result.zip(a, b);

      expect(Result.unwrapErr(zipped)).toBe('error2');
    });

    test('should return first Err if both are Err', () => {
      const a = Result.err('error1');

      const b = Result.err('error2');

      const zipped = Result.zip(a, b);

      expect(Result.unwrapErr(zipped)).toBe('error1');
    });
  });

  describe('fromThrowable', () => {
    test('should return Ok when function succeeds', () => {
      const result = Result.fromThrowable(() => 42);

      assert.isTrue(Result.isOk(result));

      expect(Result.unwrapOk(result)).toBe(42);

      expectType<typeof result, Result<number, Error>>('<=');
    });

    test('should return Ok with object when function succeeds', () => {
      const obj = { name: 'test', value: 123 } as const;

      const result = Result.fromThrowable(() => obj);

      assert.isTrue(Result.isOk(result));

      assert.deepStrictEqual(Result.unwrapOk(result), obj);
    });

    test('should return Err when function throws Error', () => {
      const errorMessage = 'Something went wrong';

      const result = Result.fromThrowable(() => {
        throw new Error(errorMessage);
      });

      assert.isTrue(Result.isErr(result));

      const error = result.value;

      expect(error).toBeInstanceOf(Error);

      expect(error.message).toBe(errorMessage);
    });

    test('should return Err when function throws string', () => {
      const errorMessage = 'String error';

      const result = Result.fromThrowable(() => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw errorMessage;
      });

      assert.isTrue(Result.isErr(result));

      const error = result.value;

      expect(error).toBeInstanceOf(Error);

      expect(error.message).toBe(errorMessage);
    });

    test('should return Err when function throws non-string primitive', () => {
      const result = Result.fromThrowable(() => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw 404;
      });

      assert.isTrue(Result.isErr(result));

      const error = result.value;

      expect(error).toBeInstanceOf(Error);

      expect(error.message).toBe('404');
    });

    test('should work with JSON.parse', () => {
      const validJson = '{"key": "value"}';

      const invalidJson = '{invalid json}';

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      const validResult = Result.fromThrowable(() => JSON.parse(validJson));

      assert.isTrue(Result.isOk(validResult));

      assert.deepStrictEqual(Result.unwrapOk(validResult), { key: 'value' });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      const invalidResult = Result.fromThrowable(() => JSON.parse(invalidJson));

      assert.isTrue(Result.isErr(invalidResult));

      const error = invalidResult.value;

      expect(error).toBeInstanceOf(Error);
    });

    test('should work with array access', () => {
      const arr = [1, 2, 3] as readonly number[];

      // This won't throw, but demonstrates the pattern
      const result = Result.fromThrowable(() => {
        const index = 5;

        const value = arr[index];

        if (value === undefined) {
          throw new Error('Index out of bounds');
        }

        return value;
      });

      assert.isTrue(Result.isErr(result));

      const error = result.value;

      expect(error.message).toBe('Index out of bounds');
    });

    test('should preserve function return type', () => {
      expectTypeOf(Result.fromThrowable(() => 'hello')).toEqualTypeOf<
        Result<string, Error>
      >();

      expectTypeOf(Result.fromThrowable(() => 42)).toEqualTypeOf<
        Result<number, Error>
      >();

      expectTypeOf(Result.fromThrowable(() => true)).toEqualTypeOf<
        Result<boolean, Error>
      >();
    });
  });

  describe('match', () => {
    test('should apply the ok case for Ok', () => {
      const result = Result.match(Result.ok(21), {
        ok: (value) => value * 2,
        err: () => 0,
      });

      expectType<typeof result, number>('=');

      assert.deepStrictEqual(result, 42);
    });

    test('should apply the err case for Err', () => {
      const result = Result.match(Result.err('failure'), {
        ok: () => 'ok',
        err: (error) => `error: ${error}`,
      });

      assert.deepStrictEqual(result, 'error: failure');
    });

    test('should support Result union inputs', () => {
      // Created through a function so that the const is not flow-narrowed to
      // the Ok side.
      const makeResult = (): Result<number, string> => Result.ok(2);

      const result = makeResult();

      const folded = Result.match(result, {
        ok: (value) => value + 1,
        err: (error) => error.length,
      });

      expectType<typeof folded, number>('=');

      assert.deepStrictEqual(folded, 3);
    });

    test('curried version should work', () => {
      const matcher = Result.match({
        ok: (value: number) => value + 1,
        err: (error: string) => error.length,
      });

      assert.deepStrictEqual(matcher(Result.ok(1)), 2);

      assert.deepStrictEqual(matcher(Result.err('oops')), 4);
    });

    test('curried version should compose with Array.map and pipe', () => {
      const matcher = Result.match({
        ok: (value: number) => `ok:${value}`,
        err: (error: string) => `err:${error}`,
      });

      const results: readonly Result<number, string>[] = [
        Result.ok(1),
        Result.err('bad'),
      ] as const;

      assert.deepStrictEqual(results.map(matcher), ['ok:1', 'err:bad']);

      const single: Result<number, string> = Result.ok(3);

      assert.deepStrictEqual(pipe(single).map(matcher).value, 'ok:3');
    });
  });

  describe('fromOptional', () => {
    test('should convert Some to Ok', () => {
      const result = Result.fromOptional(Optional.some(42), 'missing');

      expectType<typeof result, Result<42, 'missing'>>('=');

      assert.deepStrictEqual(result, Result.ok(42));
    });

    test('should convert None to Err with the provided error', () => {
      const result = Result.fromOptional(Optional.none, 'missing');

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(result.value, 'missing');
    });

    test('should convert Some(undefined) to Ok(undefined), not Err', () => {
      const makeOptional = (): Optional<undefined> => Optional.some(undefined);

      const result = Result.fromOptional(makeOptional(), 'missing');

      assert.isTrue(Result.isOk(result));

      assert.deepStrictEqual(result.value, undefined);
    });

    test('should support Optional union inputs', () => {
      // Created through a function so that the const is not flow-narrowed to
      // the Some side.
      const makeOptional = (): Optional<number> => Optional.some(2);

      const result = Result.fromOptional(makeOptional(), 'missing');

      expectType<typeof result, Result<number, 'missing'>>('=');

      assert.deepStrictEqual(result, Result.ok(2));
    });

    test('curried version should work', () => {
      const withMissingError = Result.fromOptional('missing');

      const result = withMissingError(Optional.some(1));

      expectType<typeof result, Result<1, 'missing'>>('=');

      assert.deepStrictEqual(result, Result.ok(1));

      assert.deepStrictEqual(
        withMissingError(Optional.none),
        Result.err('missing'),
      );
    });
  });

  describe('safeTry', () => {
    test('should return the body result when every yielded Result is Ok', () => {
      const result = Result.safeTry(function* () {
        const x = yield* Result.safeUnwrap(Result.ok(2));

        const y = yield* Result.safeUnwrap(Result.ok(3));

        return Result.ok(x + y);
      });

      expectType<typeof result, Result<number, never>>('=');

      assert.deepStrictEqual(result, Result.ok(5));
    });

    test('should short-circuit on the first Err', () => {
      const makeFailing = (): Result<number, string> =>
        Result.err('first error');

      const failing = makeFailing();

      let mut_reached = false;

      const result = Result.safeTry(function* () {
        const x = yield* Result.safeUnwrap(failing);

        mut_reached = true;

        return Result.ok(x);
      });

      assert.isFalse(mut_reached);

      assert.deepStrictEqual(result, Result.err('first error'));
    });

    test('should collect error types from yields and the return', () => {
      const makeSource = (): Result<number, 'e1'> => Result.ok(1);

      const source = makeSource();

      const result = Result.safeTry(function* () {
        const x = yield* Result.safeUnwrap(source);

        if (x > 0) {
          return Result.err('e2');
        }

        return Result.ok(x);
      });

      expectType<typeof result, Result<number, 'e1' | 'e2'>>('=');

      assert.deepStrictEqual(result, Result.err('e2'));
    });

    test('async generator should return a Promise of the body result', async () => {
      const result = await Result.safeTry(async function* () {
        const x = yield* Result.safeUnwrap(
          await Result.fromPromise(Promise.resolve(10)),
        );

        return Result.ok(x + 1);
      });

      assert.deepStrictEqual(result, Result.ok(11));
    });

    test('async generator should short-circuit on Err', async () => {
      const makeFailing = (): Promise<Result<number, string>> =>
        Promise.resolve(Result.err('async error'));

      let mut_reached = false;

      const promise = Result.safeTry(async function* () {
        const x = yield* Result.safeUnwrap(await makeFailing());

        mut_reached = true;

        return Result.ok(x);
      });

      expectType<typeof promise, Promise<Result<number, string>>>('=');

      const result = await promise;

      assert.isFalse(mut_reached);

      assert.deepStrictEqual(result, Result.err('async error'));
    });

    test('should run pending `finally` blocks when short-circuiting', () => {
      // Created through a function so that the const is not flow-narrowed to
      // the Err side.
      const makeFailing = (): Result<number, string> => Result.err('boom');

      let mut_cleanedUp = false;

      const result = Result.safeTry(function* () {
        try {
          const x = yield* Result.safeUnwrap(makeFailing());

          return Result.ok(x);
        } finally {
          mut_cleanedUp = true;
        }
      });

      assert.isTrue(mut_cleanedUp);

      assert.deepStrictEqual(result, Result.err('boom'));
    });

    test('should propagate an exception thrown by the body', () => {
      expect(() =>
        Result.safeTry(function* () {
          const x = yield* Result.safeUnwrap(Result.ok(1));

          throw new Error(`boom: ${x}`);
        }),
      ).toThrow('boom: 1');
    });

    test('async generator should reject on an exception thrown by the body', async () => {
      await expect(
        Result.safeTry(async function* () {
          const x = yield* Result.safeUnwrap(
            await Promise.resolve(Result.ok(1)),
          );

          throw new Error(`boom: ${x}`);
        }),
      ).rejects.toThrow('boom: 1');
    });

    test('should propagate through a delegating helper generator', () => {
      const makeSource = (): Result<number, 'e1'> => Result.err('e1');

      const doubled = function* (): Generator<Err<'e1'>, number, unknown> {
        const x = yield* Result.safeUnwrap(makeSource());

        return x * 2;
      };

      const result = Result.safeTry(function* () {
        const y = yield* doubled();

        return Result.ok(y);
      });

      expectType<typeof result, Result<number, 'e1'>>('=');

      assert.deepStrictEqual(result, Result.err('e1'));
    });

    test('async generator should run pending `finally` blocks too', async () => {
      const makeFailing = (): Promise<Result<number, string>> =>
        Promise.resolve(Result.err('boom'));

      let mut_cleanedUp = false;

      const result = await Result.safeTry(async function* () {
        try {
          const x = yield* Result.safeUnwrap(await makeFailing());

          return Result.ok(x);
        } finally {
          mut_cleanedUp = true;
        }
      });

      assert.isTrue(mut_cleanedUp);

      assert.deepStrictEqual(result, Result.err('boom'));
    });
  });

  describe('safeUnwrap', () => {
    test('should return the value without yielding for an Ok', () => {
      const generator = Result.safeUnwrap(Result.ok(7));

      assert.deepStrictEqual(generator.next(), { done: true, value: 7 });
    });

    test('should yield the Err itself for an Err', () => {
      const makeFailing = (): Result<number, string> => Result.err('boom');

      const generator = Result.safeUnwrap(makeFailing());

      assert.deepStrictEqual(generator.next(), {
        done: false,
        value: Result.err('boom'),
      });
    });

    test('should throw if resumed after yielding an Err', () => {
      const makeFailing = (): Result<number, string> => Result.err('boom');

      const generator = Result.safeUnwrap(makeFailing());

      generator.next();

      expect(() => generator.next()).toThrow(
        'it must only be used via `yield*` inside `safeTry()`',
      );
    });
  });
});
