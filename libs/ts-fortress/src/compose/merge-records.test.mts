import { expectType, Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../validation-error.mjs';
import { mergeRecords } from './merge-records.mjs';

describe('mergeRecords', () => {
  // @ts-expect-error should pass record type
  mergeRecords([record({ x: number(), y: number() }), number()]);

  const targetType = mergeRecords([
    record({ x: number(), y: number() }),
    record({ z: number(), w: number() }),
  ]);

  type TargetType = TypeOf<typeof targetType>;

  expectType<
    TargetType,
    Readonly<{
      x: number;
      y: number;
      z: number;
      w: number;
    }>
  >('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = { x: 0, y: 1, z: 2, w: 3 };

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('truthy case 2', () => {
      const x: unknown = { x: 0, y: 1, z: 2, w: 3, a: 0, b: 0 };

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: unknown = { x: 0, y: 1 };

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
      const result = targetType.validate({ x: 0, y: 1, z: 2, w: 3 });
      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toStrictEqual({ x: 0, y: 1, z: 2, w: 3 });
      }
    });

    test('falsy case', () => {
      const result = targetType.validate({ x: 0, y: 1 });
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: { x: 0, y: 1 },
            expectedType:
              'Intersection<{ x: number, y: number }, { z: number, w: number }>',
            typeName:
              'Intersection<{ x: number, y: number }, { z: number, w: number }>',
            message:
              'The type of value is expected to match all types of { { x: number, y: number }, { z: number, w: number } }',
          },
          {
            path: ['z'],
            actualValue: { x: 0, y: 1 },
            expectedType: '{ z: number, w: number }',
            typeName: '{ z: number, w: number }',
            message: 'Missing required key "z"',
          },
          {
            path: ['w'],
            actualValue: { x: 0, y: 1 },
            expectedType: '{ z: number, w: number }',
            typeName: '{ z: number, w: number }',
            message: 'Missing required key "w"',
          },
        ]);
        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'The type of value is expected to match all types of { { x: number, y: number }, { z: number, w: number } }',
          'Missing required key "z" at z',
          'Missing required key "w" at w',
        ]);
      }
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = { x: 0, y: 1, z: 2, w: 3 };

      expect(targetType.fill(x)).toStrictEqual({ x: 0, y: 1, z: 2, w: 3 });
    });

    test('fill with the default value', () => {
      const x = { x: 0, y: 1, z: 2 };

      expect(targetType.fill(x)).toStrictEqual({ x: 0, y: 1, z: 2, w: 0 });
    });
  });
});
