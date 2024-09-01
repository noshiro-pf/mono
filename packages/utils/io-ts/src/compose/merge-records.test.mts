import { expectType } from '@noshiro/ts-utils';
import { number } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { type TypeOf } from '../type.mjs';
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
