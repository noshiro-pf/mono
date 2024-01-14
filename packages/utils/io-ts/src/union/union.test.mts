import { expectType } from '@noshiro/ts-utils';
import { number, numberLiteral, stringLiteral } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { type TypeOf } from '../type.mjs';
import { union } from './union.mjs';

describe('union', () => {
  const targetType = union({
    defaultType: numberLiteral(3),
    types: [
      record({ x: number(0), y: number(0) }),
      numberLiteral(3),
      stringLiteral('2'),
    ],
  } as const);

  type TargetType = TypeOf<typeof targetType>;

  expectType<
    TargetType,
    | Readonly<{
        x: number;
        y: number;
      }>
    | '2'
    | 3
  >('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = Math.random() >= 0 ? 3 : '0'; // the value is always 1

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('truthy case 2', () => {
      const x: unknown = { x: 1, y: 2 };

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: unknown = Math.random() >= 0 ? 5 : '0'; // the value is always 5

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('falsy case', () => {
      expect(targetType.validate(5).value).toStrictEqual([
        "The type of value is expected to be one of the elements contained in { { x: number, y: number }, numberLiteral(3), stringLiteral(2) }, but it is actually '5'.",
      ]);
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
