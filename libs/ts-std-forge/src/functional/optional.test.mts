import type { None, Some } from '../adt-types.mjs';
import { expectType } from '../expect-type.mjs';
import { unknownToString } from '../others/index.mjs';
import { SafeNumber } from '../safe-number/index.mjs';
import { Optional, type UnknownOptional } from './optional/index.mjs';
import { pipe } from './pipe.mjs';
import { Result } from './result/index.mjs';

/** An `Optional<T>` that TypeScript does not narrow to `Some` or `None`. */
const asOptional = <T,>(optional: Optional<T>): Optional<T> => optional;

describe('Optional test', () => {
  describe('some', () => {
    test('should create a Some variant with the provided value', () => {
      const someNumber = Optional.some(42);

      assert.isTrue(Optional.isSome(someNumber));

      expect(Optional.unwrap(someNumber)).toBe(42);

      const someString = Optional.some('hello');

      assert.isTrue(Optional.isSome(someString));

      expect(Optional.unwrap(someString)).toBe('hello');

      const someObject = Optional.some({ name: 'Alice', age: 30 });

      assert.isTrue(Optional.isSome(someObject));

      assert.deepStrictEqual(Optional.unwrap(someObject), {
        name: 'Alice',
        age: 30,
      });
    });

    test('should preserve const types', () => {
      expectTypeOf(Optional.some('test' as const)).toEqualTypeOf<
        Some<'test'>
      >();
    });
  });

  describe('none', () => {
    test('should be a singleton None value', () => {
      assert.isTrue(Optional.isNone(Optional.none));

      assert.isFalse(Optional.isSome(Optional.none));

      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      expect(Optional.unwrapOr(Optional.none, undefined)).toBeUndefined();
    });

    test('should always reference the same instance', () => {
      expect(Optional.none).toBe(Optional.none);
    });
  });

  describe('isSome and isNone', () => {
    test('should correctly identify Some values', () => {
      const some = Optional.some(42);

      assert.isTrue(Optional.isSome(some));

      assert.isFalse(Optional.isNone(some));
    });

    test('should correctly identify None values', () => {
      const none = Optional.none;

      assert.isFalse(Optional.isSome(none));

      assert.isTrue(Optional.isNone(none));
    });

    test('should act as type guards', () => {
      const optional = Optional.some(42) as Optional<number>;

      if (Optional.isSome(optional)) {
        expectType<typeof optional, Some<number>>('=');
      }

      if (Optional.isNone(optional)) {
        expectType<typeof optional, None>('<=');
      }
    });
  });

  describe('map', () => {
    test('should map over Some values', () => {
      const some = Optional.some(5);

      const mapped = Optional.map(some, (x) => x * 2);

      assert.isTrue(Optional.isSome(mapped));

      if (Optional.isSome(mapped)) {
        expect(Optional.unwrap(mapped)).toBe(10);
      }
    });

    test('should return None for None values', () => {
      const none = Optional.none;

      const mapped = Optional.map(none, (x: never) => x * 2);

      assert.isTrue(Optional.isNone(mapped));
    });

    test('should support chaining', () => {
      const result = Optional.map(
        Optional.map(Optional.some('hello'), (s) => s.toUpperCase()),
        (s) => s.length,
      );

      if (Optional.isSome(result)) {
        expect(Optional.unwrap(result)).toBe(5);
      }
    });

    test('curried form is usable from a caller generic over the optional', () => {
      // The motivating case: with the curried parameter fixed to `Optional<S>`,
      // `S` binds to `Optional.Unwrap<O>` here and a bare
      // `O extends UnknownOptional` is not assignable to
      // `Optional<Optional.Unwrap<O>>`, so this only compiles because the
      // returned function is generic over the whole optional.
      const liftMap =
        <O extends UnknownOptional, B>(mapFn: (x: Optional.Unwrap<O>) => B) =>
        (optional: O): Optional<B> =>
          Optional.map(mapFn)(optional);

      const lengthOf = liftMap<Optional<string>, number>((s) => s.length);

      const mapped = lengthOf(Optional.some('abc'));

      expectType<typeof mapped, Optional<number>>('=');

      assert.deepStrictEqual(mapped, Optional.some(3));

      assert.deepStrictEqual(lengthOf(Optional.none), Optional.none);
    });

    test('curried form still infers the result precisely', () => {
      const mapToLength = Optional.map((text: string) => text.length);

      const mapped = mapToLength(Optional.some('abc'));

      expectType<typeof mapped, Optional<number>>('=');

      assert.deepStrictEqual(mapped, Optional.some(3));

      const empty = mapToLength(Optional.none);

      expectType<typeof empty, Optional<number>>('=');

      assert.deepStrictEqual(empty, Optional.none);
    });

    test('curried form still rejects a mismatched value type', () => {
      const mapToLength = Optional.map((text: string) => text.length);

      // @ts-expect-error an Optional<number> is not an Optional<string>
      const rejected = (): unknown => mapToLength(Optional.some(42));

      expect(rejected).toBeTypeOf('function');
    });

    test('should preserve types correctly', () => {
      const some = Optional.some(42);

      expectTypeOf(Optional.map(some, (x) => x.toString())).toEqualTypeOf<
        Optional<string>
      >();
    });

    test('should support curried form', () => {
      const doubler = Optional.map((x: number) => x * 2);

      const some = Optional.some(5);

      const mapped = doubler(some);

      assert.isTrue(Optional.isSome(mapped));

      if (Optional.isSome(mapped)) {
        expect(Optional.unwrap(mapped)).toBe(10);
      }

      const none = Optional.none;

      const mappedNone = doubler(none);

      assert.isTrue(Optional.isNone(mappedNone));
    });

    test('should work with pipe when curried', () => {
      const doubler = Optional.map((x: number) => x * 2);

      const toStringFn = Optional.map((x: number) => x.toString());

      const result = pipe(Optional.some(5)).map(doubler).map(toStringFn).value;

      assert.isTrue(Optional.isSome(result));

      if (Optional.isSome(result)) {
        expect(Optional.unwrap(result)).toBe('10');
      }
    });
  });

  describe('unwrap', () => {
    test('should return the value for Some', () => {
      expect(Optional.unwrap(Optional.some(42))).toBe(42);

      expect(Optional.unwrap(Optional.some('hello'))).toBe('hello');

      expect(Optional.unwrap(Optional.some(null))).toBeNull();
    });

    test('should unwrap an Optional narrowed by isSome to its value type alone', () => {
      // With `| undefined` in the result, this would not compile.
      const valueOrNone = <O extends UnknownOptional>(
        o: O,
      ): Optional.Unwrap<O> | 'none' =>
        Optional.isSome(o) ? Optional.unwrap(o) : 'none';

      assert.strictEqual(valueOrNone(Optional.some(1)), 1);

      assert.strictEqual(valueOrNone(Optional.none), 'none');

      const maybe = asOptional<number>(Optional.some(1));

      assert.isTrue(Optional.isSome(maybe));

      if (!Optional.isSome(maybe)) {
        return;
      }

      const value = Optional.unwrap(maybe);

      expectType<typeof value, number>('=');

      assert.strictEqual(value, 1);
    });

    test('should return undefined for None', () => {
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      expect(Optional.unwrapOr(Optional.none, undefined)).toBeUndefined();

      assert.isUndefined(Optional.unwrap(asOptional<number>(Optional.none)));
    });

    test('should have correct return types', () => {
      const someNumber = Optional.some(42);

      const fromSome = Optional.unwrap(someNumber);

      expectType<typeof fromSome, 42>('=');

      assert.strictEqual(fromSome, 42);

      const fromOptional = Optional.unwrap(asOptional<number>(someNumber));

      expectType<typeof fromOptional, number | undefined>('=');

      assert.strictEqual(fromOptional, 42);

      const none = Optional.none;

      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      expectTypeOf(Optional.unwrapOr(none, undefined)).toExtend<undefined>();
    });
  });

  describe('unwrapThrow', () => {
    test('should return the value for Some', () => {
      expect(Optional.unwrapThrow(Optional.some(42))).toBe(42);

      expect(Optional.unwrapThrow(Optional.some('hello'))).toBe('hello');
    });

    test('should throw for None', () => {
      expect(() => Optional.unwrapThrow(Optional.none)).toThrow(
        '`unwrapThrow()` has failed because it is `None`',
      );
    });

    test('should have correct return types', () => {
      const someNumber = Optional.some(42);

      expectTypeOf(Optional.unwrapThrow(someNumber)).toExtend<number>();
    });
  });

  describe('unwrapOr', () => {
    test('should return the value for Some', () => {
      expect(Optional.unwrapOr(Optional.some(42), 0)).toBe(42);

      expect(Optional.unwrapOr(Optional.some('hello'), 'default')).toBe(
        'hello',
      );
    });

    test('should return the default value for None', () => {
      expect(Optional.unwrapOr(Optional.none, 0)).toBe(0);

      expect(Optional.unwrapOr(Optional.none, 'default')).toBe('default');
    });

    test('should have correct return types', () => {
      const someNumber = Optional.some(42);

      expectTypeOf(Optional.unwrapOr(someNumber, 0)).toExtend<number>();

      expectTypeOf(Optional.unwrapOr(someNumber, 'default')).toExtend<
        number | string
      >();

      const none = Optional.none;

      expectTypeOf(Optional.unwrapOr(none, 'default')).toExtend<string>();
    });

    test('should support curried form', () => {
      const unwrapWithDefault = Optional.unwrapOr(42);

      const someValue = Optional.some(100);

      const result = unwrapWithDefault(someValue);

      expect(result).toBe(100);

      const noneValue = Optional.none;

      const defaultResult = unwrapWithDefault(noneValue);

      expect(defaultResult).toBe(42);
    });

    test('should work with pipe when curried', () => {
      const unwrapWithDefault = Optional.unwrapOr('default');

      const someResult = pipe(Optional.some('hello')).map(
        unwrapWithDefault,
      ).value;

      expect(someResult).toBe('hello');

      const noneResult = pipe(Optional.none).map(unwrapWithDefault).value;

      expect(noneResult).toBe('default');
    });
  });

  describe('expectToBe', () => {
    test('should return the value for Some', () => {
      const expectNumber = Optional.expectToBe('Expected a number');

      expect(expectNumber(Optional.some(42))).toBe(42);
    });

    test('should throw with custom message for None', () => {
      const expectNumber = Optional.expectToBe('Expected a number');

      expect(() => expectNumber(Optional.none)).toThrow('Expected a number');
    });

    test('should be curried', () => {
      const expectValidId = Optional.expectToBe('ID is required');

      const id1 = Optional.some('user-123');

      const id2 = Optional.none;

      expect(expectValidId(id1)).toBe('user-123');

      expect(() => expectValidId(id2)).toThrow('ID is required');
    });

    test('should support curried form', () => {
      const getValue = Optional.expectToBe('Value must exist');

      const someValue = Optional.some('important data');

      const result = getValue(someValue);

      expect(result).toBe('important data');

      const noneValue = Optional.none;

      expect(() => getValue(noneValue)).toThrow('Value must exist');
    });

    test('should work with pipe when curried', () => {
      const expectUser = Optional.expectToBe('User not found');

      const someResult = pipe(Optional.some({ name: 'Alice', age: 30 })).map(
        expectUser,
      ).value;

      assert.deepStrictEqual(someResult, { name: 'Alice', age: 30 });

      expect(() => pipe(Optional.none).map(expectUser).value).toThrow(
        'User not found',
      );
    });
  });

  describe('type utilities', () => {
    test('should correctly unwrap types', () => {
      type SomeNumber = Some<number>;

      type UnwrappedNumber = Optional.Unwrap<SomeNumber>;

      expectType<UnwrappedNumber, number>('=');

      type UnwrappedNone = Optional.Unwrap<None>;

      expectType<UnwrappedNone, never>('=');
    });

    test('should correctly narrow types', () => {
      type MaybeNumber = Optional<number>;

      type OnlySome = Optional.NarrowToSome<MaybeNumber>;

      expectType<OnlySome, Some<number>>('=');

      type OnlyNone = Optional.NarrowToNone<MaybeNumber>;

      expectType<OnlyNone, None>('=');
    });
  });

  describe('flatMap', () => {
    test('should chain operations that return Optional', () => {
      const parseNumber = (s: string): Optional<number> => {
        const n = Result.unwrapOkOr(SafeNumber.parse(s), Number.NaN);

        return Number.isNaN(n) ? Optional.none : Optional.some(n);
      };

      const result = Optional.flatMap(Optional.some('42'), parseNumber);

      if (Optional.isSome(result)) {
        expect(Optional.unwrap(result)).toBe(42);
      }

      const invalid = Optional.flatMap(Optional.some('abc'), parseNumber);

      assert.isTrue(Optional.isNone(invalid));
    });

    test('should return None if input is None', () => {
      const result = Optional.flatMap(Optional.none, (_: never) =>
        Optional.some(42),
      );

      assert.isTrue(Optional.isNone(result));
    });

    test('should support chaining multiple flatMaps', () => {
      const parseNumber = (s: string): Optional<number> => {
        const n = Result.unwrapOkOr(SafeNumber.parse(s), Number.NaN);

        return Number.isNaN(n) ? Optional.none : Optional.some(n);
      };

      const divideBy =
        (divisor: number) =>
        (n: number): Optional<number> =>
          divisor === 0
            ? Optional.none
            : // eslint-disable-next-line total-functions/no-partial-division
              Optional.some(n / divisor);

      const intermediate = Optional.flatMap(Optional.some('100'), parseNumber);

      const result = Optional.flatMap(intermediate, divideBy(2));

      if (Optional.isSome(result)) {
        expect(Optional.unwrap(result)).toBe(50);
      }
    });

    test('should support curried form', () => {
      const parseNumber = (s: string): Optional<number> => {
        const n = Result.unwrapOkOr(SafeNumber.parse(s), Number.NaN);

        return Number.isNaN(n) ? Optional.none : Optional.some(n);
      };

      const parser = Optional.flatMap(parseNumber);

      const result = parser(Optional.some('42'));

      assert.isTrue(Optional.isSome(result));

      if (Optional.isSome(result)) {
        expect(Optional.unwrap(result)).toBe(42);
      }

      const invalid = parser(Optional.some('abc'));

      assert.isTrue(Optional.isNone(invalid));

      const noneResult = parser(Optional.none);

      assert.isTrue(Optional.isNone(noneResult));
    });

    test('should work with pipe when curried', () => {
      const parseNumber = (s: string): Optional<number> => {
        const n = Result.unwrapOkOr(SafeNumber.parse(s), Number.NaN);

        return Number.isNaN(n) ? Optional.none : Optional.some(n);
      };

      const doubleIfPositive = (n: number): Optional<number> =>
        n > 0 ? Optional.some(n * 2) : Optional.none;

      const parser = Optional.flatMap(parseNumber);

      const doubler = Optional.flatMap(doubleIfPositive);

      const result = pipe(Optional.some('42')).map(parser).map(doubler).value;

      assert.isTrue(Optional.isSome(result));

      if (Optional.isSome(result)) {
        expect(Optional.unwrap(result)).toBe(84);
      }
    });
  });

  describe('filter', () => {
    test('should keep Some values that match predicate', () => {
      const someEven = Optional.some(4);

      const filtered = Optional.filter(someEven, (x) => x % 2 === 0);

      if (Optional.isSome(filtered)) {
        expect(Optional.unwrap(filtered)).toBe(4);
      }
    });

    test('should return None for Some values that do not match predicate', () => {
      const someOdd = Optional.some(5);

      const filtered = Optional.filter(someOdd, (x) => x % 2 === 0);

      assert.isTrue(Optional.isNone(filtered));
    });

    test('should return None if input is None', () => {
      const filtered = Optional.filter(Optional.none, (_: never) => true);

      assert.isTrue(Optional.isNone(filtered));
    });

    test('should support curried form', () => {
      const evenFilter = Optional.filter((x: number) => x % 2 === 0);

      const someEven = Optional.some(4);

      const filtered = evenFilter(someEven);

      assert.isTrue(Optional.isSome(filtered));

      if (Optional.isSome(filtered)) {
        expect(Optional.unwrap(filtered)).toBe(4);
      }

      const someOdd = Optional.some(5);

      const filteredOdd = evenFilter(someOdd);

      assert.isTrue(Optional.isNone(filteredOdd));

      const noneResult = evenFilter(Optional.none);

      assert.isTrue(Optional.isNone(noneResult));
    });

    test('should work with pipe when curried', () => {
      const evenFilter = Optional.filter((x: number) => x % 2 === 0);

      const positiveFilter = Optional.filter((x: number) => x > 0);

      const result = pipe(Optional.some(4))
        .map(evenFilter)
        .map(positiveFilter).value;

      assert.isTrue(Optional.isSome(result));

      if (Optional.isSome(result)) {
        expect(Optional.unwrap(result)).toBe(4);
      }

      const filtered = pipe(Optional.some(3)).map(evenFilter).value;

      assert.isTrue(Optional.isNone(filtered));
    });
  });

  describe('orElse', () => {
    test('should return the first Optional if it is Some', () => {
      const primary = Optional.some(42);

      const fallback = Optional.some(100);

      const result = Optional.orElse(primary, fallback);

      if (Optional.isSome(result)) {
        expect(Optional.unwrap(result)).toBe(42);
      }
    });

    test('should return the alternative if the first is None', () => {
      const primary = Optional.none;

      const fallback = Optional.some('default');

      const result = Optional.orElse(primary, fallback);

      if (Optional.isSome(result)) {
        expect(Optional.unwrap(result)).toBe('default');
      }
    });

    test('should return None if both are None', () => {
      const result = Optional.orElse(Optional.none, Optional.none);

      assert.isTrue(Optional.isNone(result));
    });

    test('should support curried form', () => {
      const fallbackTo = Optional.orElse(Optional.some('fallback'));

      const someValue = Optional.some('primary');

      const result = fallbackTo(someValue);

      assert.isTrue(Optional.isSome(result));

      if (Optional.isSome(result)) {
        expect(Optional.unwrap(result)).toBe('primary');
      }

      const noneValue = Optional.none;

      const fallbackResult = fallbackTo(noneValue);

      assert.isTrue(Optional.isSome(fallbackResult));

      if (Optional.isSome(fallbackResult)) {
        expect(Optional.unwrap(fallbackResult)).toBe('fallback');
      }
    });

    test('should work with pipe when curried', () => {
      const fallbackTo = Optional.orElse(Optional.some('backup'));

      const someResult = pipe(Optional.some('original')).map(fallbackTo).value;

      assert.isTrue(Optional.isSome(someResult));

      if (Optional.isSome(someResult)) {
        expect(Optional.unwrap(someResult)).toBe('original');
      }

      const noneResult = pipe(Optional.none).map(fallbackTo).value;

      assert.isTrue(Optional.isSome(noneResult));

      if (Optional.isSome(noneResult)) {
        expect(Optional.unwrap(noneResult)).toBe('backup');
      }
    });
  });

  describe('zip', () => {
    test('should combine two Some values into a tuple', () => {
      const a = Optional.some(1);

      const b = Optional.some('hello');

      const zipped = Optional.zip(a, b);

      if (Optional.isSome(zipped)) {
        assert.deepStrictEqual(Optional.unwrap(zipped), [1, 'hello']);
      }
    });

    test('should return None if first is None', () => {
      const a = Optional.none;

      const b = Optional.some('hello');

      const zipped = Optional.zip(a, b);

      assert.isTrue(Optional.isNone(zipped));
    });

    test('should return None if second is None', () => {
      const a = Optional.some(1);

      const b = Optional.none;

      const zipped = Optional.zip(a, b);

      assert.isTrue(Optional.isNone(zipped));
    });

    test('should return None if both are None', () => {
      const zipped = Optional.zip(Optional.none, Optional.none);

      assert.isTrue(Optional.isNone(zipped));
    });
  });

  describe('fromNullable', () => {
    test('should convert non-null values to Some', () => {
      const helloOpt = Optional.fromNullable('hello');

      if (Optional.isSome(helloOpt)) {
        expect(Optional.unwrap(helloOpt)).toBe('hello');
      }

      const numOpt = Optional.fromNullable(42);

      if (Optional.isSome(numOpt)) {
        expect(Optional.unwrap(numOpt)).toBe(42);
      }

      const zeroOpt = Optional.fromNullable(0);

      if (Optional.isSome(zeroOpt)) {
        expect(Optional.unwrap(zeroOpt)).toBe(0);
      }

      const emptyOpt = Optional.fromNullable('');

      if (Optional.isSome(emptyOpt)) {
        expect(Optional.unwrap(emptyOpt)).toBe('');
      }

      const falseOpt = Optional.fromNullable(false);

      if (Optional.isSome(falseOpt)) {
        assert.isFalse(Optional.unwrap(falseOpt));
      }
    });

    test('should convert null to None', () => {
      assert.isTrue(Optional.isNone(Optional.fromNullable(null)));
    });

    test('should convert undefined to None', () => {
      assert.isTrue(Optional.isNone(Optional.fromNullable(undefined)));
    });

    test('should work with union types', () => {
      const value: string | null = 'test';

      expectTypeOf(Optional.fromNullable(value)).toExtend<Optional<string>>();
    });
  });

  describe('toNullable', () => {
    test('should convert Some to its value', () => {
      expect(Optional.toNullable(Optional.some(42))).toBe(42);

      expect(Optional.toNullable(Optional.some('hello'))).toBe('hello');

      expect(Optional.toNullable(Optional.some(null))).toBeNull();
    });

    test('should convert None to null', () => {
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      expect(Optional.toNullable(Optional.none)).toBeUndefined();
    });

    test('should have correct return type', () => {
      const some = Optional.some(42);

      expectTypeOf(Optional.toNullable(some)).toExtend<number | undefined>();
    });
  });

  describe('edge cases', () => {
    test('should handle undefined as a Some value', () => {
      const someUndefined = Optional.some(undefined);

      assert.isTrue(Optional.isSome(someUndefined));

      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      expect(Optional.unwrap(someUndefined)).toBeUndefined();

      // This is different from None
      expect(someUndefined).not.toBe(Optional.none);
    });

    test('should handle null as a Some value', () => {
      const someNull = Optional.some(null);

      assert.isTrue(Optional.isSome(someNull));

      expect(Optional.unwrap(someNull)).toBeNull();
    });

    test('should handle nested Optionals', () => {
      const nested = Optional.some(Optional.some(42));

      assert.isTrue(Optional.isSome(nested));

      const inner = Optional.unwrap(nested);

      expectType<typeof inner, Some<42>>('=');

      expect(Optional.unwrap(inner)).toBe(42);
    });

    test('should keep Some(None) distinct from None', () => {
      const someNone = Optional.some(Optional.none);

      assert.isTrue(Optional.isSome(someNone));

      expect(someNone).not.toBe(Optional.none);

      assert.isTrue(Optional.isNone(Optional.unwrap(someNone)));
    });

    test('should keep every level of a deeply nested None', () => {
      const depth3 = Optional.some(Optional.some(Optional.some(Optional.none)));

      const depth2 = Optional.unwrap(depth3);

      const depth1 = Optional.unwrap(depth2);

      const depth0 = Optional.unwrap(depth1);

      assert.isTrue(Optional.isSome(depth3));

      assert.isTrue(Optional.isSome(depth2));

      assert.isTrue(Optional.isSome(depth1));

      assert.isTrue(Optional.isNone(depth0));
    });

    test('should give Some(None) when map returns None', () => {
      const mapped = Optional.map(Optional.some(1), () => Optional.none);

      expectType<typeof mapped, Optional<None>>('=');

      assert.isTrue(Optional.isSome(mapped));

      assert.isTrue(Optional.isNone(Optional.unwrap(mapped)));
    });

    test('should tell a missing key from a key holding None', () => {
      const entries = new Map<string, Optional<number>>([
        ['present', Optional.none],
      ]);

      const get = (key: string): Optional<Optional<number>> =>
        entries.has(key)
          ? Optional.fromNullable(entries.get(key))
          : Optional.none;

      assert.isTrue(Optional.isSome(get('present')));

      assert.isTrue(Optional.isNone(get('missing')));
    });

    test('should make some(some(5)) the same runtime value as some(5)', () => {
      expect(Optional.some(Optional.some(5)) as unknown).toBe(Optional.some(5));
    });

    test('should return a non-nullish, non-string value itself as the Some', () => {
      const value = { id: 1 } as const;

      // The representation, not the contract: what makes a Some free.
      expect(Optional.some(value) as unknown).toBe(value);

      expect(Optional.unwrap(Optional.some(value))).toBe(value);
    });
  });

  describe('reserved strings', () => {
    // The strings `Optional.none` and nested Optionals are made of.
    const prefix = 'ts-std-forge::Optional/';

    const reserved = [
      `${prefix}n0`,
      `${prefix}n1`,
      `${prefix}n2`,
      `${prefix}n01`,
      `${prefix}nx`,
      `${prefix}n`,
      `${prefix}n9999999999999999999`,
      `${prefix}n999999998`,
      `${prefix}n999999999`,
      `${prefix}n1000000000`,
      `${prefix}r`,
      `${prefix}rn0`,
      `${prefix}rr`,
      `${prefix}f`,
      `${prefix}fu`,
      `${prefix}f0`,
      `${prefix}fx`,
      `${prefix}rfu`,
      `${prefix}x`,
      prefix,
      'ts-std-forge::Optional',
      '',
      'n0',
    ] as const;

    test.each(reserved)('should hold %j as a Some and give it back', (str) => {
      const held = Optional.some(str);

      assert.isTrue(Optional.isSome(held));

      expect(Optional.unwrap(held)).toBe(str);
    });

    test.each(reserved)('should hold %j two levels deep', (str) => {
      const held = Optional.some(Optional.some(str));

      const inner = Optional.unwrap(held);

      assert.isTrue(Optional.isSome(inner));

      expect(Optional.unwrap(inner)).toBe(str);
    });

    test('should keep None, Some(None), Some of a falsy value and held strings distinct', () => {
      const values = [
        Optional.none,
        Optional.some(Optional.none),
        Optional.some(undefined),
        Optional.some(null),
        Optional.some(0),
        // `<prefix>n0` is `none`'s runtime value, so `some` of it is
        // `some(none)`, which is in the list already: checked below instead.
        ...reserved
          .filter((str) => str !== `${prefix}n0`)
          .map((str) => Optional.some(str)),
      ] as const;

      const distinct = new Set<unknown>(values);

      expect(distinct.size).toBe(values.length);
    });

    test('should make None a reserved string', () => {
      const none: unknown = Optional.none;

      assert.isTrue(typeof none === 'string' && none.startsWith(prefix));
    });

    test('should hold a reserved string that is no marker as an escape', () => {
      // The representation, not the contract: how such a string gains a level.
      expect(Optional.some(`${prefix}x`) as unknown).toBe(`${prefix}rx`);
    });

    test('should hold the string None is made of as Some(None)', () => {
      expect(Optional.some(`${prefix}n0`) as unknown).toBe(`${prefix}n1`);

      expect(Optional.some(Optional.none) as unknown).toBe(`${prefix}n1`);
    });
  });

  describe('falsy values', () => {
    const falsy = [undefined, null, false, 0, -0, Number.NaN, '', 0n] as const;

    test.each(falsy)('should hold %o and give it back', (value) => {
      const held = Optional.some(value);

      assert.isTrue(Optional.isSome(held));

      assert.isTrue(Object.is(Optional.unwrap(held), value));

      const nested = Optional.unwrap(Optional.some(held));

      assert.isTrue(Object.is(Optional.unwrap(nested), value));
    });

    test.each(falsy)(
      'should hold a Some of %o as the value itself, at every level',
      (value) => {
        // Not rewritten: a Some of a falsy value is falsy at runtime, although
        // its type is an object, so an Optional is tested with `isSome` /
        // `isNone`, never with truthiness or `??`.
        assert.isTrue(Object.is(Optional.some(value), value));

        const three = Optional.some(Optional.some(Optional.some(value)));

        assert.isTrue(Object.is(three, value));

        assert.isTrue(
          Object.is(
            Optional.unwrap(Optional.unwrapThrow(Optional.unwrapThrow(three))),
            value,
          ),
        );
      },
    );

    test.each(falsy)(
      'should keep a Some of %o apart from None and Some(None)',
      (value) => {
        const held: unknown = Optional.some(value);

        assert.isFalse(Object.is(held, Optional.none));

        assert.isFalse(Object.is(held, Optional.some(Optional.none)));

        assert.isTrue(Optional.isSome(Optional.some(value)));
      },
    );

    test('should keep unwrapOr from replacing Some(undefined) or Some(null)', () => {
      assert.isUndefined(Optional.unwrapOr(Optional.some(undefined), 5));

      assert.isNull(Optional.unwrapOr(Optional.some(null), 5));

      assert.strictEqual(Optional.unwrapOr(Optional.none, 5), 5);
    });

    test('should keep None a non-empty string at runtime', () => {
      const none: unknown = Optional.none;

      // Truthy and not nullish, as the object type of `None` says.
      assert.isTrue(typeof none === 'string' && none !== '');
    });
  });

  describe('serialization', () => {
    const optionals = [
      Optional.none,
      Optional.some(1),
      Optional.some('text'),
      Optional.some({ id: 1 }),
      Optional.some(Optional.none),
      Optional.some(Optional.some(Optional.none)),
    ] as const;

    test.each(optionals)('should survive structuredClone (%#)', (optional) => {
      assert.deepStrictEqual(structuredClone(optional), optional);
    });

    test.each(optionals)(
      'should survive a JSON round trip (%#)',
      (optional) => {
        // What a server or a file would hold: the round trip is the point, not
        // a way to clone.
        const json = JSON.stringify([optional]);

        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        const parsed = JSON.parse(json) as unknown as readonly [
          typeof optional,
        ];

        assert.deepStrictEqual(parsed[0], optional);
      },
    );
  });

  describe('match', () => {
    test('should apply the some case for Some', () => {
      const result = Optional.match(Optional.some(21), {
        some: (value) => value * 2,
        none: () => 0,
      });

      expectType<typeof result, number>('=');

      assert.strictEqual(result, 42);
    });

    test('should apply the none case for None', () => {
      const result = Optional.match(Optional.none, {
        some: () => 'some',
        none: () => 'none',
      });

      assert.strictEqual(result, 'none');
    });

    test('should support Optional union inputs', () => {
      const optional: Optional<number> = Optional.some(3);

      const result = Optional.match(optional, {
        some: (value) => `value: ${value}`,
        none: () => 'none',
      });

      expectType<typeof result, string>('=');

      assert.strictEqual(result, 'value: 3');
    });

    test('curried version should work', () => {
      const matcher = Optional.match({
        some: (value: number) => `value: ${value}`,
        none: () => 'none',
      });

      const result = matcher(Optional.some(3));

      expectType<typeof result, string>('=');

      assert.strictEqual(result, 'value: 3');

      assert.strictEqual(matcher(Optional.none), 'none');
    });

    test('curried version should compose with Array.map and pipe', () => {
      const matcher = Optional.match({
        some: (value: number) => `some:${value}`,
        none: () => 'none',
      });

      const optionals: readonly Optional<number>[] = [
        Optional.some(1),
        Optional.none,
      ] as const;

      assert.deepStrictEqual(optionals.map(matcher), ['some:1', 'none']);

      const single: Optional<number> = Optional.some(3);

      assert.strictEqual(pipe(single).map(matcher).value, 'some:3');
    });

    test('should apply the some case for Some(undefined)', () => {
      const makeOptional = (): Optional<undefined> => Optional.some(undefined);

      const result = Optional.match(makeOptional(), {
        some: (value) => `some: ${unknownToString(value)}`,
        none: () => 'none',
      });

      assert.strictEqual(result, 'some: undefined');
    });
  });
});
