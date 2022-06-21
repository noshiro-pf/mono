import { assertType } from '@noshiro/ts-utils';
import { enumType } from './enum';
import type { Typeof } from './type';

describe('enumType', () => {
  const targetType = enumType({
    values: [3, '2', 'a'],
    defaultValue: 3,
  } as const);

  type TargetType = Typeof<typeof targetType>;

  assertType<TypeEq<TargetType, '2' | 'a' | 3>>();

  assertType<TypeEq<typeof targetType.defaultValue, TargetType>>();

  describe('validate', () => {
    test('truthy case', () => {
      const x: number | string = Math.random() >= 0 ? 3 : '0'; // the value is always 1

      if (targetType.is(x)) {
        assertType<TypeEq<typeof x, TargetType>>();
      } else {
        assertType<TypeEq<typeof x, number | string>>();
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: number | string = Math.random() >= 0 ? 5 : '0'; // the value is always 5

      if (targetType.is(x)) {
        assertType<TypeEq<typeof x, TargetType>>();
      } else {
        assertType<TypeEq<typeof x, number | string>>();
      }

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: number = (() => 3)();

      expect(targetType.fill(x)).toBe(3);
    });

    test('fill with the default value', () => {
      const x: number = (() => 5)();

      expect(targetType.fill(x)).toBe(3);
    });
  });
});
