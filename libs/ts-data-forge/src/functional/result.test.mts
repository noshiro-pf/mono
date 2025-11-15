import { expectType } from '../expect-type.mjs';
import { Optional } from './optional/index.mjs';
import { pipe } from './pipe.mjs';
import { Result } from './result/index.mjs';

describe('Result test', () => {
  describe('ok', () => {
    test('creates Ok result', () => {
      const result = Result.ok(42);

      expect(Result.isOk(result)).toBe(true);

      expect(Result.isErr(result)).toBe(false);

      expect(result.value).toBe(42);

      expectType<typeof result, Result<number, never>>('<=');
    });

    test('creates Ok result with string', () => {
      const result = Result.ok('success');

      expect(Result.isOk(result)).toBe(true);

      expect(result.value).toBe('success');

      expectType<typeof result, Result<string, never>>('<=');
    });
  });

  describe('err', () => {
    test('creates Err result', () => {
      const result = Result.err('error message');

      expect(Result.isErr(result)).toBe(true);

      expect(Result.isOk(result)).toBe(false);

      expect(result.value).toBe('error message');

      expectType<typeof result, Result<never, string>>('<=');
    });

    test('creates Err result with number', () => {
      const result = Result.err(404);

      expect(Result.isErr(result)).toBe(true);

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

      expect(Result.isOk(result)).toBe(false);
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

      expect(Result.isErr(result)).toBe(false);
    });
  });

  describe('isResult', () => {
    test('recognizes Ok results', () => {
      const result = Result.ok(42);

      expect(Result.isResult(result)).toBe(true);
    });

    test('recognizes Err results', () => {
      const result = Result.err('error');

      expect(Result.isResult(result)).toBe(true);
    });

    test('rejects non-Result values', () => {
      expect(Result.isResult(42)).toBe(false);

      expect(Result.isResult('string')).toBe(false);

      expect(Result.isResult(null)).toBe(false);

      expect(Result.isResult(undefined)).toBe(false);

      expect(Result.isResult({})).toBe(false);

      expect(Result.isResult({ type: 'unknown', value: 42 })).toBe(false);
    });
  });

  describe('map', () => {
    test('maps Ok result', () => {
      const result = Result.ok(5);

      const mapped = Result.map(result, (x) => x * 2);

      expect(Result.isOk(mapped)).toBe(true);

      if (Result.isOk(mapped)) {
        expect(mapped.value).toBe(10);
      }

      expectType<typeof mapped, Result<number, never>>('<=');
    });

    test('preserves Err result', () => {
      const result: Result<number, string> = Result.err('error');

      const mapped = Result.map(result, (x) => x * 2);

      expect(Result.isErr(mapped)).toBe(true);

      if (Result.isErr(mapped)) {
        expect(mapped.value).toBe('error');
      }

      expectType<typeof mapped, Result<number, string>>('<=');
    });

    test('should support curried form', () => {
      const doubler = Result.map((x: number) => x * 2);

      const okResult = Result.ok(5);

      const mapped = doubler(okResult);

      expect(Result.isOk(mapped)).toBe(true);

      if (Result.isOk(mapped)) {
        expect(mapped.value).toBe(10);
      }

      const errResult: Result<number, string> = Result.err('error');

      const mappedErr = doubler(errResult);

      expect(Result.isErr(mappedErr)).toBe(true);

      if (Result.isErr(mappedErr)) {
        expect(mappedErr.value).toBe('error');
      }
    });

    test('should work with pipe when curried', () => {
      const doubler = Result.map((x: number) => x * 2);

      const toStringFn = Result.map((x: number) => x.toString());

      const result = pipe(Result.ok(5)).map(doubler).map(toStringFn).value;

      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe('10');
      }
    });
  });

  describe('mapErr', () => {
    test('maps Err result', () => {
      const result: Result<number, string> = Result.err('error');

      const mapped = Result.mapErr(result, (e) => e.toUpperCase());

      expect(Result.isErr(mapped)).toBe(true);

      if (Result.isErr(mapped)) {
        expect(mapped.value).toBe('ERROR');
      }

      expectType<typeof mapped, Result<number, string>>('<=');
    });

    test('preserves Ok result', () => {
      const result: Result<number, string> = Result.ok(42);

      const mapped = Result.mapErr(result, (e: string) => e.toUpperCase());

      expect(Result.isOk(mapped)).toBe(true);

      if (Result.isOk(mapped)) {
        expect(mapped.value).toBe(42);
      }

      expectType<typeof mapped, Result<number, string>>('~=');
    });

    test('should support curried form', () => {
      const errorUppercase = Result.mapErr((e: string) => e.toUpperCase());

      const errResult: Result<number, string> = Result.err('error');

      const mapped = errorUppercase(errResult);

      expect(Result.isErr(mapped)).toBe(true);

      if (Result.isErr(mapped)) {
        expect(mapped.value).toBe('ERROR');
      }

      const okResult: Result<number, string> = Result.ok(42);

      const mappedOk = errorUppercase(okResult);

      expect(Result.isOk(mappedOk)).toBe(true);

      if (Result.isOk(mappedOk)) {
        expect(mappedOk.value).toBe(42);
      }
    });

    test('should work with pipe when curried', () => {
      const errorUppercase = Result.mapErr((e: string) => e.toUpperCase());

      const errorPrefix = Result.mapErr((e: string) => `ERROR: ${e}`);

      const result = pipe(Result.err('failed'))
        .map(errorUppercase)
        .map(errorPrefix).value;

      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toBe('ERROR: FAILED');
      }
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

      expect(Result.isOk(folded)).toBe(true);

      if (Result.isOk(folded)) {
        expect(folded.value).toBe(84);
      }

      expectType<typeof folded, Result<number, number>>('=');
    });

    test('folds Err result', () => {
      const result: Result<number, string> = Result.err('error');

      const folded = Result.fold(
        result,
        (x) => x * 2,
        (e) => e.length,
      );

      expect(Result.isErr(folded)).toBe(true);

      if (Result.isErr(folded)) {
        expect(folded.value).toBe(5); // length of 'error'
      }

      expectType<typeof folded, Result<number, number>>('=');
    });

    test('should support curried form', () => {
      const folder = Result.fold(
        (x: number) => x * 2,
        (e: string) => e.length,
      );

      const okResult = Result.ok(42);

      const foldedOk = folder(okResult);

      expect(Result.isOk(foldedOk)).toBe(true);

      if (Result.isOk(foldedOk)) {
        expect(foldedOk.value).toBe(84);
      }

      const errResult: Result<number, string> = Result.err('error');

      const foldedErr = folder(errResult);

      expect(Result.isErr(foldedErr)).toBe(true);

      if (Result.isErr(foldedErr)) {
        expect(foldedErr.value).toBe(5);
      }
    });

    test('should work with pipe when curried', () => {
      const folder = Result.fold(
        (x: number) => x * 2,
        () => 0,
      );

      const result = pipe(Result.ok(21)).map(folder).value;

      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(42);
      }

      const errorResult = pipe(Result.err('error')).map(folder).value;

      expect(Result.isErr(errorResult)).toBe(true);

      if (Result.isErr(errorResult)) {
        expect(errorResult.value).toBe(0);
      }
    });
  });

  describe('fromPromise', () => {
    test('handles async functions that resolve', async () => {
      const asyncFn = async (): Promise<number> =>
        Promise.resolve().then(() => 42);

      const result = await Result.fromPromise(asyncFn());

      expect(Result.isOk(result)).toBe(true);

      expect(Result.unwrapOk(result)).toBe(42);
    });

    test('handles async functions that reject', async () => {
      const error = new Error('Async error');

      const asyncFn = async (): Promise<number> =>
        Promise.reject(error).then(() => 42);

      const result = await Result.fromPromise(asyncFn());

      expect(Result.isErr(result)).toBe(true);

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
        const n = Number(s);

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

      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(5);
      }

      const divideByZero = Result.flatMap((x: number) => divide(x, 0));

      const errorResult = divideByZero(Result.ok(10));

      expect(Result.isErr(errorResult)).toBe(true);

      if (Result.isErr(errorResult)) {
        expect(errorResult.value).toBe('Division by zero');
      }

      const initialError = divideBy2(Result.err('initial error'));

      expect(Result.isErr(initialError)).toBe(true);

      if (Result.isErr(initialError)) {
        expect(initialError.value).toBe('initial error');
      }
    });

    test('should work with pipe when curried', () => {
      const parseNumber = (s: string): Result<number, string> => {
        const n = Number(s);

        return Number.isNaN(n) ? Result.err('Not a number') : Result.ok(n);
      };

      const doubleIfPositive = (n: number): Result<number, string> =>
        n > 0 ? Result.ok(n * 2) : Result.err('Not positive');

      const parser = Result.flatMap(parseNumber);

      const doubler = Result.flatMap(doubleIfPositive);

      const result = pipe(Result.ok('42')).map(parser).map(doubler).value;

      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe(84);
      }
    });
  });

  describe('swap', () => {
    test('should swap Ok to Err', () => {
      const okResult = Result.ok(42);

      const swapped = Result.swap(okResult);

      expect(Result.isErr(swapped)).toBe(true);

      expect(Result.unwrapErr(swapped)).toBe(42);
    });

    test('should swap Err to Ok', () => {
      const errResult = Result.err('error');

      const swapped = Result.swap(errResult);

      expect(Result.isOk(swapped)).toBe(true);

      expect(Result.unwrapOk(swapped)).toBe('error');
    });
  });

  describe('toOptional', () => {
    test('should convert Ok to Some-like', () => {
      const okResult = Result.ok(42);

      const optional = Result.toOptional(okResult);

      expect(Optional.isSome(optional)).toBe(true);

      expect(Optional.unwrapThrow(optional)).toBe(42);
    });

    test('should convert Err to None-like', () => {
      const errResult = Result.err('error');

      const optional = Result.toOptional(errResult);

      expect(Optional.isNone(optional)).toBe(true);
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

      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toBe('primary');
      }

      const errResult: Result<string, string> = Result.err('failed');

      const fallbackResult = fallbackTo(errResult);

      expect(Result.isOk(fallbackResult)).toBe(true);

      if (Result.isOk(fallbackResult)) {
        expect(fallbackResult.value).toBe('fallback');
      }
    });

    test('should work with pipe when curried', () => {
      const fallbackTo = Result.orElse(Result.ok('backup'));

      const okResult = pipe(Result.ok('original')).map(fallbackTo).value;

      expect(Result.isOk(okResult)).toBe(true);

      if (Result.isOk(okResult)) {
        expect(okResult.value).toBe('original');
      }

      const errResult = pipe(Result.err('network error')).map(fallbackTo).value;

      expect(Result.isOk(errResult)).toBe(true);

      if (Result.isOk(errResult)) {
        expect(errResult.value).toBe('backup');
      }
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

      expect(Result.isOk(result)).toBe(true);

      expect(Result.unwrapOk(result)).toBe(42);

      expectType<typeof result, Result<number, Error>>('<=');
    });

    test('should return Ok with object when function succeeds', () => {
      const obj = { name: 'test', value: 123 };

      const result = Result.fromThrowable(() => obj);

      expect(Result.isOk(result)).toBe(true);

      assert.deepStrictEqual(Result.unwrapOk(result), obj);
    });

    test('should return Err when function throws Error', () => {
      const errorMessage = 'Something went wrong';

      const result = Result.fromThrowable(() => {
        throw new Error(errorMessage);
      });

      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        const error = result.value;

        expect(error).toBeInstanceOf(Error);

        expect(error.message).toBe(errorMessage);
      }
    });

    test('should return Err when function throws string', () => {
      const errorMessage = 'String error';

      const result = Result.fromThrowable(() => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw errorMessage;
      });

      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        const error = result.value;

        expect(error).toBeInstanceOf(Error);

        expect(error.message).toBe(errorMessage);
      }
    });

    test('should return Err when function throws non-string primitive', () => {
      const result = Result.fromThrowable(() => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw 404;
      });

      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        const error = result.value;

        expect(error).toBeInstanceOf(Error);

        expect(error.message).toBe('404');
      }
    });

    test('should work with JSON.parse', () => {
      const validJson = '{"key": "value"}';

      const invalidJson = '{invalid json}';

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      const validResult = Result.fromThrowable(() => JSON.parse(validJson));

      expect(Result.isOk(validResult)).toBe(true);

      assert.deepStrictEqual(Result.unwrapOk(validResult), { key: 'value' });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      const invalidResult = Result.fromThrowable(() => JSON.parse(invalidJson));

      expect(Result.isErr(invalidResult)).toBe(true);

      if (Result.isErr(invalidResult)) {
        const error = invalidResult.value;

        expect(error).toBeInstanceOf(Error);
      }
    });

    test('should work with array access', () => {
      const arr = [1, 2, 3];

      // This won't throw, but demonstrates the pattern
      const result = Result.fromThrowable(() => {
        const index = 5;

        const value = arr[index];

        if (value === undefined) {
          throw new Error('Index out of bounds');
        }

        return value;
      });

      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        const error = result.value;

        expect(error.message).toBe('Index out of bounds');
      }
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
});
