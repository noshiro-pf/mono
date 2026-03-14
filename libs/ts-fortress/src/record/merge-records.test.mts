import { expectType, Result } from 'ts-data-forge';
import { number, string } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { mergeRecords } from './merge-records.mjs';
import { record, strictRecord } from './record.mjs';

describe(mergeRecords, () => {
  test('argument must be a non-empty array of record types', () => {
    expect(() => {
      // @ts-expect-error should pass record type
      mergeRecords([record({ x: number(), y: number() }), number()]);
    }).toThrowError('Cannot convert undefined or null to object');
  });

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
      const x: unknown = { x: 0, y: 1, z: 2, w: 3 } as const;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case 2', () => {
      const x: unknown = { x: 0, y: 1, z: 2, w: 3, a: 0, b: 0 } as const;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case', () => {
      const x: unknown = { x: 0, y: 1 } as const;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate({ x: 0, y: 1, z: 2, w: 3 });

      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, { x: 0, y: 1, z: 2, w: 3 });
    });

    // test('validate returns input as-is for OK cases', () => {
    //   const input = { x: 0, y: 1, z: 2, w: 3 } as const;

    //   const result = targetType.validate(input);

    //   assert.isTrue(Result.isOk(result));

    //   const resultValue1 = Result.unwrapThrow(result);

    //   expect(resultValue1).toBe(input); // ✅ same reference
    // });

    test('falsy case', () => {
      const result = targetType.validate({ x: 0, y: 1 });

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: ['z'],
          actualValue: { x: 0, y: 1 },
          expectedType: '({ x: number, y: number } & { z: number, w: number })',
          typeName: '({ x: number, y: number } & { z: number, w: number })',
          details: {
            kind: 'missing-key',
            key: 'z',
          },
        },
        {
          path: ['w'],
          actualValue: { x: 0, y: 1 },
          expectedType: '({ x: number, y: number } & { z: number, w: number })',
          typeName: '({ x: number, y: number } & { z: number, w: number })',
          details: {
            kind: 'missing-key',
            key: 'w',
          },
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error at z: missing required key "z".',
        'Error at w: missing required key "w".',
      ]);
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = { x: 0, y: 1, z: 2, w: 3 } as const;

      assert.deepStrictEqual(targetType.fill(x), { x: 0, y: 1, z: 2, w: 3 });
    });

    test('fill with the default value', () => {
      const x = { x: 0, y: 1, z: 2 } as const;

      assert.deepStrictEqual(targetType.fill(x), { x: 0, y: 1, z: 2, w: 0 });
    });
  });
});

describe('mergeRecords with strictRecord', () => {
  const s1 = strictRecord({ id: string(), name: string() });

  const s2 = strictRecord({ age: number() });

  const merged = mergeRecords([s1, s2]);

  type Merged = TypeOf<typeof merged>;

  expectType<Merged, Readonly<{ id: string; name: string; age: number }>>('=');

  describe('is', () => {
    test('accepts valid data with all merged keys', () => {
      assert.isTrue(merged.is({ id: '1', name: 'Alice', age: 30 }));
    });

    test('rejects data with missing keys', () => {
      assert.isFalse(merged.is({ id: '1', name: 'Alice' }));
    });

    test('rejects non-record values', () => {
      assert.isFalse(merged.is(null));

      assert.isFalse(merged.is('string'));
    });
  });

  describe('validate', () => {
    test('succeeds for valid data', () => {
      const result = merged.validate({ id: '1', name: 'Alice', age: 30 });

      assert.isTrue(Result.isOk(result));

      assert.deepStrictEqual(Result.unwrapThrow(result), {
        id: '1',
        name: 'Alice',
        age: 30,
      });
    });

    test('reports missing key errors', () => {
      const result = merged.validate({ id: '1' });

      assert.isTrue(Result.isErr(result));

      const messages = validationErrorsToMessages(
        Result.unwrapErrThrow(result),
      );

      assert.isTrue(
        messages.some((m) => m.includes('missing required key "name"')),
      );

      assert.isTrue(
        messages.some((m) => m.includes('missing required key "age"')),
      );
    });

    test('reports property type errors', () => {
      const result = merged.validate({ id: '1', name: 'Alice', age: 'thirty' });

      assert.isTrue(Result.isErr(result));

      const messages = validationErrorsToMessages(
        Result.unwrapErrThrow(result),
      );

      assert.isTrue(messages.some((m) => m.includes('Error at age:')));
    });
  });

  describe('fill', () => {
    test('fills missing keys with defaults', () => {
      const result = merged.fill({ id: 'x' });

      assert.deepStrictEqual(result, { id: 'x', name: '', age: 0 });
    });

    test('fills from non-record input with all defaults', () => {
      const result = merged.fill(null);

      assert.deepStrictEqual(result, { id: '', name: '', age: 0 });
    });
  });

  describe('with excessPropertyValidation: error', () => {
    const mergedStrict = mergeRecords([s1, s2], {
      excessPropertyValidation: 'error',
    });

    test('accepts valid data without excess', () => {
      assert.isTrue(mergedStrict.is({ id: '1', name: 'Alice', age: 30 }));
    });

    test('rejects data with excess properties', () => {
      assert.isFalse(
        mergedStrict.is({ id: '1', name: 'Alice', age: 30, extra: true }),
      );
    });

    test('validate reports excess key error', () => {
      const result = mergedStrict.validate({
        id: '1',
        name: 'Alice',
        age: 30,
        extra: true,
      });

      assert.isTrue(Result.isErr(result));

      const messages = validationErrorsToMessages(
        Result.unwrapErrThrow(result),
      );

      assert.isTrue(
        messages.some((m) => m.includes('excess property "extra"')),
      );
    });
  });

  describe('mixed strict and permissive', () => {
    const permissive = record({ status: string() });

    const mergedMixed = mergeRecords([s1, permissive]);

    test('accepts valid data', () => {
      assert.isTrue(mergedMixed.is({ id: '1', name: 'Alice', status: 'ok' }));
    });

    test('accepts data with excess (default strip mode)', () => {
      assert.isTrue(
        mergedMixed.is({ id: '1', name: 'Alice', status: 'ok', extra: 1 }),
      );
    });

    test('validate strips excess properties in default mode', () => {
      const result = mergedMixed.validate({
        id: '1',
        name: 'Alice',
        status: 'ok',
        extra: 1,
      });

      assert.isTrue(Result.isOk(result));

      assert.deepStrictEqual(Result.unwrapThrow(result), {
        id: '1',
        name: 'Alice',
        status: 'ok',
      });
    });
  });
});
