import { expectType, Result } from 'ts-data-forge';
import { number, string } from '../primitives/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { record } from './record.mjs';
import { valueof } from './valueof.mjs';

describe('valueof', () => {
  const ymdValue = valueof(
    record({
      year: number(1900),
      month: number(1),
      date: number(1),
    }),
  );

  expectType<typeof ymdValue, Type<number>>('=');

  type YmdValue = TypeOf<typeof ymdValue>;

  expectType<YmdValue, number>('=');

  expectType<typeof ymdValue.defaultValue, YmdValue>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 2000;

      if (ymdValue.is(x)) {
        expectType<typeof x, number>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(ymdValue.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: unknown = 'not-a-number';

      if (ymdValue.is(x)) {
        expectType<typeof x, number>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(ymdValue.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const x: unknown = 2000;

      const result = ymdValue.validate(x);
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expectType<typeof result.value, YmdValue>('=');
        expect(result.value).toBe(2000);
      }
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 2000;
      const result = ymdValue.validate(input);
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe(input); // ✅ same reference
      }
    });

    test('falsy case', () => {
      const x: unknown = 'not-a-number';

      const result = ymdValue.validate(x);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 'not-a-number',
            expectedType:
              'ValueOf<{ year: number, month: number, date: number }>',
            typeName: 'ValueOf<{ year: number, month: number, date: number }>',
            message:
              'The type of value is expected to be one of the elements contained in { number, number, number }',
          },
        ]);
        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'The type of value is expected to be one of the elements contained in { number, number, number }',
        ]);
      }
    });
  });

  describe('fill', () => {
    test('from external value', () => {
      const x: unknown = 'not-a-number';

      expect(ymdValue.fill(x)).toBe(1900);
    });

    test('from valid number', () => {
      const x = 2000;

      expect(ymdValue.fill(x)).toBe(2000);
    });
  });

  describe('mixed types', () => {
    const mixedValue = valueof(
      record({
        name: string('John'),
        age: number(25),
      }),
    );

    expectType<typeof mixedValue, Type<string | number>>('=');

    type MixedValue = TypeOf<typeof mixedValue>;

    expectType<MixedValue, string | number>('=');

    test('accepts string', () => {
      const x: unknown = 'Alice';
      expect(mixedValue.is(x)).toBe(true);
    });

    test('accepts number', () => {
      const x: unknown = 30;
      expect(mixedValue.is(x)).toBe(true);
    });

    test('rejects boolean', () => {
      const x: unknown = true;
      expect(mixedValue.is(x)).toBe(false);
    });

    test('validate mixed values', () => {
      const stringResult = mixedValue.validate('Alice');
      expect(Result.isOk(stringResult)).toBe(true);
      if (Result.isOk(stringResult)) {
        expect(stringResult.value).toBe('Alice');
      }

      const numberResult = mixedValue.validate(30);
      expect(Result.isOk(numberResult)).toBe(true);
      if (Result.isOk(numberResult)) {
        expect(numberResult.value).toBe(30);
      }
    });

    test('fill from invalid value uses first type default', () => {
      expect(mixedValue.fill(true)).toBe('John');
    });
  });

  describe('same type values', () => {
    const sameTypeValue = valueof(
      record({
        first: string('hello'),
        second: string('world'),
      }),
    );

    expectType<typeof sameTypeValue, Type<string>>('=');

    test('accepts any string', () => {
      expect(sameTypeValue.is('test')).toBe(true);
    });

    test('rejects non-string', () => {
      expect(sameTypeValue.is(123)).toBe(false);
    });
  });
});
