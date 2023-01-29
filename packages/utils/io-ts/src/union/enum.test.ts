import { expectType } from '@noshiro/ts-utils';
import { type TypeOf } from '../type';
import { enumType } from './enum';

describe('enumType', () => {
  const targetType = enumType({
    values: [3, '2', 'a'],
    defaultValue: 3,
  } as const);

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, '2' | 'a' | 3>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: number | string = Math.random() >= 0 ? 3 : '0'; // the value is always 1

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, number | string>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: number | string = Math.random() >= 0 ? 5 : '0'; // the value is always 5

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, number | string>('=');
      }

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('falsy case', () => {
      expect(targetType.validate(5).value).toStrictEqual([
        "The value is expected to be one of the elements contained in { 3, 2, a }, but it is actually '5'.",
      ]);
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
