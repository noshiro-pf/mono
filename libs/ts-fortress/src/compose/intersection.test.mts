import { expectType, Result } from 'ts-data-forge';
import { uintRange } from '../enum/index.mjs';
import { number } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { intersection } from './intersection.mjs';

describe(intersection, () => {
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

        assert.isTrue(targetType.is(x));
      });

      test('truthy case 2', () => {
        const x: unknown = { x: 0, y: 1, z: 2, w: 3, a: 0, b: 0 };

        if (targetType.is(x)) {
          expectType<typeof x, TargetType>('=');
        } else {
          expectType<typeof x, unknown>('=');
        }

        assert.isTrue(targetType.is(x));
      });

      test('falsy case', () => {
        const x: unknown = { x: 0, y: 1 };

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

        expectType<
          typeof result,
          Result<TargetType, readonly ValidationError[]>
        >('=');

        assert.isTrue(Result.isOk(result));

        const resultValue = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue, { x: 0, y: 1, z: 2, w: 3 });
      });

      test('validate returns input as-is for OK cases', () => {
        const input = { x: 0, y: 1, z: 2, w: 3 };

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
            path: [],
            actualValue: { x: 0, y: 1 },
            expectedType:
              '({ x: number, y: number } & { z: number, w: number })',
            typeName: '({ x: number, y: number } & { z: number, w: number })',
            details: {
              kind: 'intersection',
              typeNames: [
                '{ x: number, y: number }',
                '{ z: number, w: number }',
              ],
            },
          },
          {
            path: ['z'],
            actualValue: { x: 0, y: 1 },
            expectedType: '{ z: number, w: number }',
            typeName: '{ z: number, w: number }',
            details: {
              kind: 'missing-key',
              key: 'z',
            },
          },
          {
            path: ['w'],
            actualValue: { x: 0, y: 1 },
            expectedType: '{ z: number, w: number }',
            typeName: '{ z: number, w: number }',
            details: {
              kind: 'missing-key',
              key: 'w',
            },
          },
        ]);

        assert.deepStrictEqual(validationErrorsToMessages(resultError), [
          'Error: expected value to match all types of { { x: number, y: number }, { z: number, w: number } } but <object> type value `{"x":0,"y":1}` was passed.',
          'Error at z: missing required key "z".',
          'Error at w: missing required key "w".',
        ]);
      });
    });

    describe('fill', () => {
      test('noop', () => {
        const x: unknown = { x: 0, y: 1, z: 2, w: 3 };

        assert.deepStrictEqual(targetType.fill(x), { x: 0, y: 1, z: 2, w: 3 });
      });

      test('fill with the default value', () => {
        const x = { x: 0, y: 1, z: 2 };

        assert.deepStrictEqual(targetType.fill(x), { x: 0, y: 1, z: 2, w: 0 });
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

        assert.isTrue(targetType.is(x));
      });

      test('falsy case', () => {
        const x: unknown = '3';

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
        const result = targetType.validate(0);

        expectType<
          typeof result,
          Result<TargetType, readonly ValidationError[]>
        >('=');

        assert.isTrue(Result.isOk(result));

        const resultValue2 = Result.unwrapThrow(result);

        expect(resultValue2).toBe(0);
      });

      test('validate returns input as-is for OK cases', () => {
        const input = 0;

        const result = targetType.validate(input);

        assert.isTrue(Result.isOk(result));

        const resultValue3 = Result.unwrapThrow(result);

        expect(resultValue3).toBe(input); // ✅ same reference
      });

      test('falsy case', () => {
        const result = targetType.validate('aaa');

        assert.isTrue(Result.isErr(result));

        const resultError1 = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(resultError1, [
          {
            path: [],
            actualValue: 'aaa',
            expectedType: '(number & number)',
            typeName: '(number & number)',
            details: {
              kind: 'intersection',
              typeNames: ['number', 'number'],
            },
          },
          {
            path: [],
            actualValue: 'aaa',
            expectedType: 'number',
            typeName: 'number',
            details: undefined,
          },
          {
            path: [],
            actualValue: 'aaa',
            expectedType: '(number & number)',
            typeName: '(number & number)',
            details: {
              kind: 'intersection',
              typeNames: ['number', 'number'],
            },
          },
          {
            path: [],
            actualValue: 'aaa',
            expectedType: 'number',
            typeName: 'number',
            details: undefined,
          },
        ]);

        assert.deepStrictEqual(validationErrorsToMessages(resultError1), [
          'Error: expected value to match all types of { number, number } but <string> type value "aaa" was passed.',
          'Error: expected <number> value but <string> type value "aaa" was passed.',
          'Error: expected value to match all types of { number, number } but <string> type value "aaa" was passed.',
          'Error: expected <number> value but <string> type value "aaa" was passed.',
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

        assert.isTrue(targetType.is(x));
      });

      test('falsy case 1', () => {
        const x: unknown = '3';

        if (targetType.is(x)) {
          expectType<typeof x, TargetType>('=');
        } else {
          expectType<typeof x, unknown>('=');
        }

        assert.isFalse(targetType.is(x));
      });

      test('falsy case 2', () => {
        const x: unknown = 7;

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
        const result = targetType.validate(3);

        expectType<
          typeof result,
          Result<TargetType, readonly ValidationError[]>
        >('=');

        assert.isTrue(Result.isOk(result));

        const resultValue4 = Result.unwrapThrow(result);

        expect(resultValue4).toBe(3);
      });

      test('validate returns input as-is for OK cases', () => {
        const input = 3;

        const result = targetType.validate(input);

        assert.isTrue(Result.isOk(result));

        const resultValue5 = Result.unwrapThrow(result);

        expect(resultValue5).toBe(input); // ✅ same reference
      });

      test('falsy case', () => {
        const result = targetType.validate(7);

        assert.isTrue(Result.isErr(result));

        const resultError2 = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(resultError2, [
          {
            path: [],
            actualValue: 7,
            expectedType: '(uintRange(0, 5) & uintRange(1, 7))',
            typeName: '(uintRange(0, 5) & uintRange(1, 7))',
            details: {
              kind: 'intersection',
              typeNames: ['uintRange(0, 5)', 'uintRange(1, 7)'],
            },
          },
          {
            path: [],
            actualValue: 7,
            expectedType: 'uintRange(0, 5)',
            typeName: 'uintRange(0, 5)',
            details: {
              kind: 'integer-range',
              start: 0,
              endExclusive: 5,
            },
          },
          {
            path: [],
            actualValue: 7,
            expectedType: '(uintRange(0, 5) & uintRange(1, 7))',
            typeName: '(uintRange(0, 5) & uintRange(1, 7))',
            details: {
              kind: 'intersection',
              typeNames: ['uintRange(0, 5)', 'uintRange(1, 7)'],
            },
          },
          {
            path: [],
            actualValue: 7,
            expectedType: 'uintRange(1, 7)',
            typeName: 'uintRange(1, 7)',
            details: {
              kind: 'integer-range',
              start: 1,
              endExclusive: 7,
            },
          },
        ]);

        assert.deepStrictEqual(validationErrorsToMessages(resultError2), [
          'Error: expected value to match all types of { uintRange(0, 5), uintRange(1, 7) } but <number> type value `7` was passed.',
          'Error: expected an integer between 0 and 4 but `7` was passed.',
          'Error: expected value to match all types of { uintRange(0, 5), uintRange(1, 7) } but <number> type value `7` was passed.',
          'Error: expected an integer between 1 and 6 but `7` was passed.',
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
