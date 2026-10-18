import { expectType, Result } from 'ts-data-forge';
import { union } from '../compose/index.mjs';
import { enumType } from '../enum/index.mjs';
import { literal } from '../other-types/index.mjs';
import { number, string } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import type { TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { array } from './array.mjs';

describe(array, () => {
  describe('arg patterns', () => {
    test('without explicit default value', () => {
      assert.deepStrictEqual(array(number()).defaultValue, []);
    });

    test('with explicit default value', () => {
      assert.deepStrictEqual(
        array(number(), {
          typeName: 'xs',
          defaultValue: [],
        }).defaultValue,
        [],
      );
    });
  });

  const xs = array(number(), {
    typeName: 'xs',
    defaultValue: [],
  });

  type Xs = TypeOf<typeof xs>;

  expectType<Xs, readonly number[]>('=');

  expectType<typeof xs.defaultValue, Xs>('=');

  describe('is', () => {
    test('truthy case', () => {
      const ys: unknown = [1, 2, 3] as const;

      if (xs.is(ys)) {
        expectType<typeof ys, Xs>('=');
      } else {
        expectType<typeof ys, unknown>('=');
      }

      assert.isTrue(xs.is(ys));
    });

    test('falsy case', () => {
      const ys: unknown = ['1', '', 3] as const;

      if (xs.is(ys)) {
        expectType<typeof ys, Xs>('=');
      } else {
        expectType<typeof ys, unknown>('=');
      }

      assert.isFalse(xs.is(ys));
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const ys: unknown = [1, 2, 3] as const;

      const result = xs.validate(ys);

      expectType<typeof result, Result<Xs, readonly ValidationError[]>>('=');

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, [1, 2, 3]);
    });

    test('falsy case', () => {
      const ys: unknown = ['1', '', 3] as const;

      assert.isFalse(xs.is(ys));

      const result = xs.validate(ys);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      // Test that we have structured ValidationError objects

      assert.deepStrictEqual(resultError, [
        {
          path: ['0'],
          actualValue: '1',
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
        {
          path: ['1'],
          actualValue: '',
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
      ]);

      // Test that we can convert to legacy string format for backward compatibility

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error at 0: expected <number> type but <string> type value "1" was passed.',
        'Error at 1: expected <number> type but <string> type value "" was passed.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = [10, 20, 30] as const;

      const result = xs.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const ys: unknown = [1, 2, 3] as const;

      assert.deepStrictEqual(xs.fill(ys), [1, 2, 3]);
    });

    test('fill with the default value', () => {
      const ys: unknown = ['1', '', 3] as const;

      assert.deepStrictEqual(xs.fill(ys), [0, 0, 3]);
    });

    test("onInvalidElement: 'fill' is the default", () => {
      const filling = array(number(), { onInvalidElement: 'fill' });

      assert.deepStrictEqual(filling.fill(['1', '', 3]), [0, 0, 3]);
    });
  });

  describe("fill with onInvalidElement: 'drop'", () => {
    const SortSpecs = array(
      record({
        key: enumType(['title', 'priority']),
        order: enumType(['asc', 'desc']),
      }),
      { onInvalidElement: 'drop' },
    );

    test('removes the elements that are not of the element type', () => {
      assert.deepStrictEqual(
        SortSpecs.fill([
          { key: 'colour', order: 'desc' },
          { key: 'priority', order: 'asc' },
        ]),
        [{ key: 'priority', order: 'asc' }],
      );
    });

    test('keeps a valid array as it is', () => {
      const ys: unknown = [1, 2, 3] as const;

      assert.deepStrictEqual(
        array(number(), { onInvalidElement: 'drop' }).fill(ys),
        [1, 2, 3],
      );
    });

    test('can drop every element', () => {
      assert.deepStrictEqual(
        array(number(), { onInvalidElement: 'drop' }).fill(['1', undefined]),
        [],
      );
    });

    test('returns the default value for a non-array', () => {
      const withDefault = array(number(), {
        onInvalidElement: 'drop',
        defaultValue: [7],
      });

      assert.deepStrictEqual(withDefault.fill('not an array'), [7]);

      assert.deepStrictEqual(withDefault.fill(undefined), [7]);
    });

    test('still fills the kept elements, which strips excess properties', () => {
      assert.deepStrictEqual(
        SortSpecs.fill([
          { key: 'title', order: 'asc', extra: 1 },
          { key: 'title' },
        ]),
        [{ key: 'title', order: 'asc' }],
      );
    });

    test('drops a nested array element as a whole rather than repairing it', () => {
      const matrix = array(array(number(), { onInvalidElement: 'drop' }), {
        onInvalidElement: 'drop',
      });

      assert.deepStrictEqual(matrix.fill([[1, 2], [3, 'x'], 'y']), [[1, 2]]);
    });

    test('an element of a union type is kept when any member accepts it', () => {
      const ids = array(union([string(), number()]), {
        onInvalidElement: 'drop',
      });

      assert.deepStrictEqual(ids.fill(['a', 1, undefined, true, 'b']), [
        'a',
        1,
        'b',
      ]);
    });

    test('applies inside a union whose default source is the array', () => {
      const listOrNone = union([
        array(number(), { onInvalidElement: 'drop' }),
        literal('none'),
      ]);

      assert.deepStrictEqual(listOrNone.fill([1, 'x', 2]), [1, 2]);

      assert.deepStrictEqual(listOrNone.fill('none'), 'none');
    });

    test('does not change is, validate or prune', () => {
      const numbers = array(number(), { onInvalidElement: 'drop' });

      assert.isFalse(numbers.is([1, 'x']));

      assert.isTrue(Result.isErr(numbers.validate([1, 'x'])));

      assert.deepStrictEqual(
        SortSpecs.prune([{ key: 'title', order: 'asc' }]),
        [{ key: 'title', order: 'asc' }],
      );
    });
  });

  describe('prune', () => {
    test('prunes each element recursively', () => {
      const points = array(record({ x: number(0), y: number(0) }));

      assert.deepStrictEqual(
        points.prune([
          { x: 1, y: 2, z: 3 },
          { x: 4, y: 5 },
        ]),
        [
          { x: 1, y: 2 },
          { x: 4, y: 5 },
        ],
      );
    });
  });
});
