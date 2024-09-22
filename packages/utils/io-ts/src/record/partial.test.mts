import { expectType } from '@noshiro/ts-utils';
import { number } from '../primitives/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import { optional } from './optional.mjs';
import { partial } from './partial.mjs';
import { record } from './record.mjs';

describe('partial', () => {
  describe('fully partial', () => {
    const ymdBase = record({
      year: number(1900),
      month: optional(number(1)),
      date: optional(number(1)),
    });

    const ymd = partial(ymdBase);

    expectType<
      typeof ymd,
      Type<Partial<Readonly<{ year: number; month: number; date: number }>>>
    >('=');

    type Ymd = TypeOf<typeof ymd>;

    expectType<
      Ymd,
      Partial<Readonly<{ year: number; month: number; date: number }>>
    >('=');

    expectType<typeof ymd.defaultValue, Ymd>('=');

    describe('is', () => {
      test('truthy case', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 12,
        };

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        expect(ymd.is(x)).toBe(true);
      });

      test('falsy case', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        };

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        expect(ymd.is(x)).toBe(false);
      });
    });

    describe('validate', () => {
      test('falsy case 1', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        };

        expect(ymd.validate(x).value).toStrictEqual([
          `The value at record key "month" is expected to be <number>, but it is actually '"ab"'.`,
          `The value is expected to be <number>, but it is actually '"ab"'.`,
        ]);
      });

      test('falsy case 2', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
        };

        expect(ymd.validate(x).value).toStrictEqual([
          `The value at record key "month" is expected to be <number>, but it is actually '"ab"'.`,
          `The value is expected to be <number>, but it is actually '"ab"'.`,
        ]);
      });
    });

    describe('fill', () => {
      test('from an empty record', () => {
        const x: UnknownRecord = {};

        expect(ymd.fill(x)).toStrictEqual({});
      });

      test('from a filled record', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 999,
          date: 999,
        };

        expect(ymd.fill(x)).toStrictEqual({
          year: 2000,
          month: 999,
          date: 999,
        });
      });

      test('from a partial record', () => {
        const x: UnknownRecord = {
          year: 2000,
        };

        expect(ymd.fill(x)).toStrictEqual({
          year: 2000,
        });
      });

      test('from a partial record with excess property', () => {
        const x: UnknownRecord = {
          year: 2000,
          aaaaa: 9999,
        };

        expect(ymd.fill(x)).toStrictEqual({
          year: 2000,
        });
      });
    });
  });

  describe('partially partial', () => {
    const ymdBase = record({
      year: number(1900),
      month: number(1),
      date: number(1),
    });

    const ymd = partial(ymdBase, { keysToBeOptional: ['month', 'date'] });

    type Ymd = TypeOf<typeof ymd>;

    expectType<Ymd, Readonly<{ year: number; month?: number; date?: number }>>(
      '=',
    );

    expectType<typeof ymd.defaultValue, Ymd>('=');

    describe('is', () => {
      test('truthy case', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
        };

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        expect(ymd.is(x)).toBe(true);
      });

      test('falsy case 1', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        };

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        expect(ymd.is(x)).toBe(false);
      });

      test('falsy case 2', () => {
        const x: UnknownRecord = {
          date: 'cd',
        };

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        expect(ymd.is(x)).toBe(false);
      });
    });

    describe('validate', () => {
      test('falsy case', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        };

        expect(ymd.validate(x).value).toStrictEqual([
          `The value at record key "month" is expected to be <number>, but it is actually '"ab"'.`,
          `The value is expected to be <number>, but it is actually '"ab"'.`,
        ]);
      });
    });

    describe('fill', () => {
      test('from an empty record', () => {
        const x: UnknownRecord = {};

        expect(ymd.fill(x)).toStrictEqual({
          year: 1900,
        });
      });

      test('from a filled record', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 999,
          date: 999,
        };

        expect(ymd.fill(x)).toStrictEqual({
          year: 2000,
          month: 999,
          date: 999,
        });
      });

      test('from a partial record', () => {
        const x: UnknownRecord = {
          year: 2000,
        };

        expect(ymd.fill(x)).toStrictEqual({
          year: 2000,
        });
      });

      test('from a partial record with excess property', () => {
        const x: UnknownRecord = {
          year: 2000,
          aaaaa: 9999,
        };

        expect(ymd.fill(x)).toStrictEqual({
          year: 2000,
        });
      });
    });
  });
});
