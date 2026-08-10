import { Result } from 'ts-data-forge';
import { number, string } from '../primitives/index.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { mergeRecords } from './merge-records.mjs';
import { record, strictRecord } from './record.mjs';

describe('mergeRecords - fill', () => {
  const A = record({ a: string(), s: string('S') });

  const B = record({ b: number(1), s: string('B') });

  test('fill with non-record uses merged defaults', () => {
    const T = mergeRecords([A, B]);

    // Non-record input: should merge defaults from A and B

    assert.deepStrictEqual(T.fill(null), { a: '', b: 1, s: 'B' });
  });

  test('fill with record merges filled values and strips excess (fill always strips)', () => {
    const T = mergeRecords([A, B]);

    const input = { a: 'x', extra: 'keep' } as const;

    // fill always strips excess properties

    assert.deepStrictEqual(T.fill(input), {
      a: 'x',
      b: 1,
      s: 'B',
    });
  });
});

describe('mergeRecords - excessProperty option', () => {
  const DefaultR1 = record({ x: number(), y: number() });

  const DefaultR2 = record({ z: number(), w: number() });

  const StrictR1 = strictRecord({ x: number(), y: number() });

  const AllowR1 = record({ a: number() }, { excessProperty: 'allow' });

  const AllowR2 = record({ b: number() }, { excessProperty: 'allow' });

  describe('default: strictest wins', () => {
    test('record + record defaults to allow', () => {
      const T = mergeRecords([DefaultR1, DefaultR2]);

      // is() returns true even with excess (allow does not reject)
      assert.isTrue(T.is({ x: 0, y: 1, z: 2, w: 3, extra: 99 }));

      // validate() keeps excess properties in the result
      const input = { x: 0, y: 1, z: 2, w: 3, extra: 99 } as const;

      const result = T.validate(input);

      assert.isTrue(Result.isOk(result));

      expect(Result.unwrapThrow(result)).toBe(input); // same reference
    });

    test('strictRecord + record defaults to reject', () => {
      const T = mergeRecords([StrictR1, DefaultR2]);

      assert.isFalse(T.is({ x: 0, y: 1, z: 2, w: 3, extra: 99 }));

      assert.isTrue(T.is({ x: 0, y: 1, z: 2, w: 3 }));
    });

    test('record(allow) + record(allow) defaults to allow', () => {
      const T = mergeRecords([AllowR1, AllowR2]);

      // allow mode: validate succeeds and keeps excess
      const input = { a: 1, b: 2, extra: 99 } as const;

      const result = T.validate(input);

      assert.isTrue(Result.isOk(result));

      expect(Result.unwrapThrow(result)).toBe(input); // same reference
    });
  });

  describe('explicit override', () => {
    test('excessProperty: allow', () => {
      const T = mergeRecords([DefaultR1, DefaultR2], {
        excessProperty: 'allow',
      });

      const input = { x: 0, y: 1, z: 2, w: 3, extra: 99 } as const;

      const result = T.validate(input);

      assert.isTrue(Result.isOk(result));

      // 'allow' returns input as-is (same reference)
      expect(Result.unwrapThrow(result)).toBe(input);
    });

    test('excessProperty: reject', () => {
      const T = mergeRecords([DefaultR1, DefaultR2], {
        excessProperty: 'reject',
      });

      // Accepts valid data
      assert.isTrue(T.is({ x: 0, y: 1, z: 2, w: 3 }));

      // Rejects excess
      const result = T.validate({ x: 0, y: 1, z: 2, w: 3, extra: 99 });

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(
        validationErrorsToMessages(Result.unwrapErrThrow(result)),
        ['Error at extra: excess property "extra" is not allowed.'],
      );
    });

    test('excessProperty: allow overrides strict records', () => {
      const S1 = strictRecord({ x: number() });

      const S2 = strictRecord({ y: number() });

      const T = mergeRecords([S1, S2], {
        excessProperty: 'allow',
      });

      const input = { x: 0, y: 1, extra: 99 } as const;

      // 'allow' override: accepts excess properties despite strict inputs
      assert.isTrue(T.is(input));

      const result = T.validate(input);

      assert.isTrue(Result.isOk(result));

      expect(Result.unwrapThrow(result)).toBe(input);
    });
  });
});

describe('mergeRecords - fill always strips excess', () => {
  const R1 = record({ x: number(), y: number() });

  const R2 = record({ z: number(), w: number() });

  test('record + record fill strips excess properties', () => {
    const T = mergeRecords([R1, R2]);

    // fill always strips excess properties
    const result = T.fill({ x: 1, z: 2, extra: 99 });

    assert.deepStrictEqual(result, { x: 1, y: 0, z: 2, w: 0 });
  });

  test('fill produces correct value when already valid', () => {
    const T = mergeRecords([R1, R2]);

    const input = { x: 0, y: 1, z: 2, w: 3 } as const;

    assert.deepStrictEqual(T.fill(input), { x: 0, y: 1, z: 2, w: 3 });
  });
});
