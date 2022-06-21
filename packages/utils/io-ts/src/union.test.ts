import { assertType } from '@noshiro/ts-utils';
import { number, numberLiteral, stringLiteral } from './primitives';
import { record } from './record';
import type { Typeof } from './type';
import { union } from './union';

describe('union', () => {
  const targetType = union({
    defaultType: numberLiteral(3),
    types: [
      record({ x: number(0), y: number(0) }),
      numberLiteral(3),
      stringLiteral('2'),
    ],
  } as const);

  type TargetType = Typeof<typeof targetType>;

  assertType<
    TypeEq<
      TargetType,
      | Readonly<{
          x: number;
          y: number;
        }>
      | '2'
      | 3
    >
  >();

  assertType<TypeEq<typeof targetType.defaultValue, TargetType>>();

  describe('validate', () => {
    test('truthy case', () => {
      const x: unknown = Math.random() >= 0 ? 3 : '0'; // the value is always 1

      if (targetType.is(x)) {
        assertType<TypeEq<typeof x, TargetType>>();
      } else {
        assertType<TypeEq<typeof x, unknown>>();
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('truthy case 2', () => {
      const x: unknown = { x: 1, y: 2 };

      if (targetType.is(x)) {
        assertType<TypeEq<typeof x, TargetType>>();
      } else {
        assertType<TypeEq<typeof x, unknown>>();
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: unknown = Math.random() >= 0 ? 5 : '0'; // the value is always 5

      if (targetType.is(x)) {
        assertType<TypeEq<typeof x, TargetType>>();
      } else {
        assertType<TypeEq<typeof x, unknown>>();
      }

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = { x: 3, y: 4 };

      expect(targetType.fill(x)).toStrictEqual({ x: 3, y: 4 });
    });

    test('fill with the default value', () => {
      const x = 5;

      expect(targetType.fill(x)).toBe(3);
    });
  });
});
