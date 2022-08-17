import { assertType } from '@noshiro/ts-utils';
import { number, numberLiteral, stringLiteral } from '../primitives';
import { record } from '../record';
import type { TypeOf } from '../type';
import { tuple } from './tuple';

describe('tuple', () => {
  const targetType = tuple({
    types: [
      record({ x: number(0), y: number(0) }),
      numberLiteral(3),
      stringLiteral('2'),
    ],
  } as const);

  type TargetType = TypeOf<typeof targetType>;

  assertType<
    TypeEq<
      TargetType,
      readonly [
        Readonly<{
          x: number;
          y: number;
        }>,
        3,
        '2'
      ]
    >
  >();

  assertType<TypeEq<typeof targetType.defaultValue, TargetType>>();

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = [{ x: 1, y: 2 }, 3, '2'];

      if (targetType.is(x)) {
        assertType<TypeEq<typeof x, TargetType>>();
      } else {
        assertType<TypeEq<typeof x, unknown>>();
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: unknown = [{ x: 'str', y: 'str' }, 3, '2'];

      if (targetType.is(x)) {
        assertType<TypeEq<typeof x, TargetType>>();
      } else {
        assertType<TypeEq<typeof x, unknown>>();
      }

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('falsy case', () => {
      const x: unknown = [{ x: 'str', y: 'str' }, 3, '2'];

      expect(targetType.validate(x).value).toStrictEqual([
        `The tuple element at 0 is expected to be <{ x: number, y: number }>, but it is actually '{"x":"str","y":"str"}'.`,
        `The value at record key "x" is expected to be <number>, but it is actually '"str"'.`,
        `The value is expected to be <number>, but it is actually '"str"'.`,
      ]);
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
