import { expectType, Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
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
    }).toThrowError(
      'Expected a record type but received a non-record type in mergeRecords',
    );
  });

  const targetType = mergeRecords([
    record({ x: number(), y: number() }),
    record({ z: number(), w: number() }),
  ]);

  type TargetType = TypeOf<typeof targetType>;

  // Default (no explicit excessProperty) with record() inputs → DeriveStrictestEP = 'allow'
  expectType<
    TargetType,
    Readonly<{
      x: number;
      y: number;
      z: number;
      w: number;
    }>
  >('=');

  expectType<typeof targetType.defaultValue, TypeOf<typeof targetType>>('=');

  // excessProperty: 'allow' → type includes UnknownRecord
  // (consistent with RecordType<R, 'allow'>)
  const _allowType = mergeRecords(
    [record({ x: number() }), record({ y: number() })],
    { excessProperty: 'allow' },
  );

  type AllowType = TypeOf<typeof _allowType>;

  expectType<AllowType, Readonly<{ x: number; y: number }>>('=');

  // excessProperty: 'reject' → exact type (no UnknownRecord)
  const _errorType = mergeRecords(
    [record({ x: number() }), record({ y: number() })],
    { excessProperty: 'reject' },
  );

  type ErrorType = TypeOf<typeof _errorType>;

  expectType<ErrorType, Readonly<{ x: number; y: number }>>('=');

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

    test('validate returns input as-is for OK cases', () => {
      const input = { x: 0, y: 1, z: 2, w: 3 } as const;

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case', () => {
      const result = targetType.validate({ x: 0, y: 1 });

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: ['z'],
          actualValue: { x: 0, y: 1 },
          typeName: '({ x: number, y: number } & { z: number, w: number })',
          expectedType: '({ x: number, y: number } & { z: number, w: number })',
          details: {
            kind: 'missing-key',
            key: 'z',
          },
        },
        {
          path: ['w'],
          actualValue: { x: 0, y: 1 },
          typeName: '({ x: number, y: number } & { z: number, w: number })',
          expectedType: '({ x: number, y: number } & { z: number, w: number })',
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

  describe('with strictRecord', () => {
    const strictTargetType = mergeRecords([
      strictRecord({ x: number(), y: number() }),
      strictRecord({ z: number(), w: number() }),
    ]);

    type StrictTargetType = TypeOf<typeof strictTargetType>;

    expectType<
      StrictTargetType,
      Readonly<{
        x: number;
        y: number;
        z: number;
        w: number;
      }>
    >('=');

    describe('is', () => {
      test('truthy case', () => {
        assert.isTrue(strictTargetType.is({ x: 0, y: 1, z: 2, w: 3 }));
      });

      test('rejects excess properties', () => {
        assert.isFalse(strictTargetType.is({ x: 0, y: 1, z: 2, w: 3, a: 0 }));
      });

      test('rejects missing properties', () => {
        assert.isFalse(strictTargetType.is({ x: 0, y: 1 }));
      });
    });

    describe('validate', () => {
      test('truthy case', () => {
        const result = strictTargetType.validate({ x: 0, y: 1, z: 2, w: 3 });

        assert.isTrue(Result.isOk(result));

        const resultValue = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue, { x: 0, y: 1, z: 2, w: 3 });
      });

      test('validate returns input as-is for OK cases', () => {
        const input = { x: 0, y: 1, z: 2, w: 3 } as const;

        const result = strictTargetType.validate(input);

        assert.isTrue(Result.isOk(result));

        expect(Result.unwrapThrow(result)).toBe(input);
      });

      test('rejects non-record input', () => {
        const result = strictTargetType.validate('not a record');

        assert.isTrue(Result.isErr(result));
      });

      test('rejects excess properties', () => {
        const result = strictTargetType.validate({
          x: 0,
          y: 1,
          z: 2,
          w: 3,
          extra: 99,
        });

        assert.isTrue(Result.isErr(result));

        const errors = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(validationErrorsToMessages(errors), [
          'Error at extra: excess property "extra" is not allowed.',
        ]);
      });

      test('rejects missing properties', () => {
        const result = strictTargetType.validate({ x: 0, y: 1 });

        assert.isTrue(Result.isErr(result));

        const errors = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(validationErrorsToMessages(errors), [
          'Error at z: missing required key "z".',
          'Error at w: missing required key "w".',
        ]);
      });
    });

    describe('fill', () => {
      test('noop', () => {
        const x: unknown = { x: 0, y: 1, z: 2, w: 3 } as const;

        assert.deepStrictEqual(strictTargetType.fill(x), {
          x: 0,
          y: 1,
          z: 2,
          w: 3,
        });
      });

      test('fill with the default value', () => {
        const x = { x: 0, y: 1, z: 2 } as const;

        assert.deepStrictEqual(strictTargetType.fill(x), {
          x: 0,
          y: 1,
          z: 2,
          w: 0,
        });
      });
    });
  });
});
