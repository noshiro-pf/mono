import { expectType } from '@noshiro/ts-utils';
import { uintRange } from '../index.mjs';
import { number } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { type TypeOf } from '../type.mjs';
import { intersection } from './intersection.mjs';

describe('intersection', () => {
  describe('merge records', () => {
    const targetType = intersection(
      [
        record({ x: number(), y: number() }),
        record({ z: number(), w: number() }),
      ],
      record({
        x: number(),
        y: number(),
        z: number(),
        w: number(),
      }),
    );

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
      test('falsy case', () => {
        expect(targetType.validate({ x: 0, y: 1 }).value).toStrictEqual([
          'The type of value is expected to match all types of { { x: number, y: number }, { z: number, w: number } }, but it is actually \'{"x":0,"y":1}\'.',
          'The record is expected to have the key "z".',
        ]);
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

  describe('merge primitives', () => {
    const targetType = intersection([number(1), number(2)], number());

    type TargetType = TypeOf<typeof targetType>;

    expectType<TargetType, number>('=');

    expectType<typeof targetType.defaultValue, TargetType>('=');

    describe('is', () => {
      test('truthy case', () => {
        const x: unknown = 0;

        if (targetType.is(x)) {
          expectType<typeof x, TargetType>('=');
        } else {
          expectType<typeof x, unknown>('=');
        }

        expect(targetType.is(x)).toBe(true);
      });

      test('falsy case', () => {
        const x: unknown = '3';

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
        expect(targetType.validate('aaa').value).toStrictEqual([
          'The type of value is expected to match all types of { number, number }, but it is actually \'"aaa"\'.',
          'The value is expected to be <number>, but it is actually \'"aaa"\'.',
        ]);
      });
    });

    describe('fill', () => {
      test('noop', () => {
        const x: unknown = 3;

        expect(targetType.fill(x)).toBe(3);
      });

      test('fill with the default value', () => {
        const x = { x: 0, y: 1, z: 2 };

        expect(targetType.fill(x)).toBe(0);
      });
    });
  });

  describe('merge unions', () => {
    const targetType = intersection(
      [uintRange({ start: 0, end: 5 }), uintRange({ start: 1, end: 7 })],
      uintRange({ start: 1, end: 4 }),
    );

    type TargetType = TypeOf<typeof targetType>;

    expectType<TargetType, 1 | 2 | 3 | 4>('=');

    expectType<typeof targetType.defaultValue, TargetType>('=');

    describe('is', () => {
      test('truthy case', () => {
        const x: unknown = 3;

        if (targetType.is(x)) {
          expectType<typeof x, TargetType>('=');
        } else {
          expectType<typeof x, unknown>('=');
        }

        expect(targetType.is(x)).toBe(true);
      });

      test('falsy case 1', () => {
        const x: unknown = '3';

        if (targetType.is(x)) {
          expectType<typeof x, TargetType>('=');
        } else {
          expectType<typeof x, unknown>('=');
        }

        expect(targetType.is(x)).toBe(false);
      });

      test('falsy case 2', () => {
        const x: unknown = 7;

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
        expect(targetType.validate(7).value).toStrictEqual([
          "The type of value is expected to match all types of { uintRange(0, 5), uintRange(1, 7) }, but it is actually '7'.",
          "The value is expected to be an integer between 0 and 4, but it is actually '7'.",
        ]);
      });
    });

    describe('fill', () => {
      test('noop', () => {
        const x: unknown = 3;

        expect(targetType.fill(x)).toBe(3);
      });

      test('fill with the default value', () => {
        const x = 9;

        expect(targetType.fill(x)).toBe(1);
      });
    });
  });
});
