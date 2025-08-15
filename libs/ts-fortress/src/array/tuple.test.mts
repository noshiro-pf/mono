import { expectType, Result } from 'ts-data-forge';
import { number, numberLiteral, stringLiteral } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { tuple } from './tuple.mjs';

describe('tuple', () => {
  describe('arg patterns', () => {
    test('without explicit default value', () => {
      expect(
        tuple([numberLiteral(1), numberLiteral(2), numberLiteral(3)])
          .defaultValue,
      ).toStrictEqual([1, 2, 3]);
    });

    test('with explicit default value', () => {
      expect(
        tuple([numberLiteral(1), numberLiteral(2), numberLiteral(3)], {
          typeName: 'tpl',
        }).typeName,
      ).toBe('tpl');
    });
  });

  const targetType = tuple([
    record({ x: number(0), y: number(0) }),
    numberLiteral(3),
    stringLiteral('2'),
  ]);

  type TargetType = TypeOf<typeof targetType>;

  expectType<
    TargetType,
    readonly [
      Readonly<{
        x: number;
        y: number;
      }>,
      3,
      '2',
    ]
  >('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = [{ x: 1, y: 2 }, 3, '2'];

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: unknown = [{ x: 'str', y: 'str' }, 3, '2'];

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const x: unknown = [{ x: 1, y: 2 }, 3, '2'];

      const result = targetType.validate(x);
      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toStrictEqual([{ x: 1, y: 2 }, 3, '2']);
      }
    });

    test('falsy case - not array', () => {
      const x: unknown = 'not an array';

      const result = targetType.validate(x);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 'not an array',
            expectedType: 'array',
            typeName: 'tuple',
            message: undefined,
          },
        ]);
      }
    });

    test('falsy case - wrong length', () => {
      const x: unknown = [{ x: 1, y: 2 }];

      const result = targetType.validate(x);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: x,
            expectedType: 'tuple',
            typeName: 'tuple',
            message:
              'The length of tuple is expected to be 3, but it is actually 1',
          },
        ]);
      }
    });

    test('falsy case - element validation errors', () => {
      const x: unknown = [{ x: 'str', y: 'str' }, 3, '2'];

      const result = targetType.validate(x);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: ['0', 'x'],
            actualValue: 'str',
            expectedType: 'number',
            typeName: 'number',
            message: undefined,
          },
          {
            path: ['0', 'y'],
            actualValue: 'str',
            expectedType: 'number',
            typeName: 'number',
            message: undefined,
          },
        ]);

        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'Expected number at 0.x, got string',
          'Expected number at 0.y, got string',
        ]);
      }
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = [{ x: 1, y: 2 }, 3, '2'];

      expect(targetType.fill(x)).toStrictEqual([{ x: 1, y: 2 }, 3, '2']);
    });

    test('fill with the default value', () => {
      const x: unknown = 5;

      expect(targetType.fill(x)).toStrictEqual([{ x: 0, y: 0 }, 3, '2']);
    });

    test('fill only the first element with the default value, case 1', () => {
      const x: unknown = [123, 3, '2'];

      expect(targetType.fill(x)).toStrictEqual([{ x: 0, y: 0 }, 3, '2']);
    });

    test('fill only the first element with the default value, case 2', () => {
      const x: unknown = [{ z: 5 }, 3, '2'];

      expect(targetType.fill(x)).toStrictEqual([{ x: 0, y: 0 }, 3, '2']);
    });

    test('fill only the second element with the default value', () => {
      const x: unknown = [{ x: 1, y: 2 }, 0, '2'];

      expect(targetType.fill(x)).toStrictEqual([{ x: 1, y: 2 }, 3, '2']);
    });

    test('fill only the third element with the default value', () => {
      const x: unknown = [{ x: 1, y: 2 }, 3, 999];

      expect(targetType.fill(x)).toStrictEqual([{ x: 1, y: 2 }, 3, '2']);
    });
  });
});
