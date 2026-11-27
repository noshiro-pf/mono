import { number } from '../primitives/index.mjs';
import type { Type } from '../type.mjs';
import { array } from './array.mjs';
import { boundedLengthArray } from './bounded-length-array.mjs';
import { boundedLengthTuple } from './bounded-length-tuple.mjs';
import { fixedLengthArray } from './fixed-length-array.mjs';
import { maxLengthArray } from './max-length-array.mjs';
import { maxLengthTuple } from './max-length-tuple.mjs';
import { minLengthArray } from './min-length-array.mjs';
import { minLengthTuple } from './min-length-tuple.mjs';
import { nonEmptyArray } from './non-empty-array.mjs';

describe('the array validators', () => {
  describe('fill of a sparse array', () => {
    const types = [
      array(number()),
      nonEmptyArray(number()),
      minLengthArray(2, number()),
      minLengthTuple(2, number()),
      maxLengthArray(5, number()),
      maxLengthTuple(5, number()),
      boundedLengthArray(2, 5, number()),
      boundedLengthTuple(2, 5, number()),
      fixedLengthArray(4, number()),
    ] as const satisfies readonly Type<readonly number[]>[];

    test.each(types)('$typeName fills the hole', (type) => {
      // The hole is the input under test.
      // @sumi-expect-error banned-syntax/no-sparse-array
      const sparse: unknown = [1, , 3, 4] as const;

      const filled = type.fill(sparse);

      // `reduce` skips holes, so it counts every index only when there is none.
      assert.strictEqual(
        filled.reduce((count) => count + 1, 0),
        filled.length,
      );

      assert.deepStrictEqual(filled, [1, 0, 3, 4]);

      assert.isTrue(type.is(filled));
    });

    test.each(types)(
      '$typeName fills the holes of a longer sparse array',
      (type) => {
        // @sumi-expect-error banned-syntax/no-sparse-array
        const sparse: unknown = [1, , 3, 4, , 6] as const;

        const filled = type.fill(sparse);

        assert.isTrue(type.is(filled));

        assert.strictEqual(
          filled.reduce((count) => count + 1, 0),
          filled.length,
        );
      },
    );
  });

  describe('a size that is not a length', () => {
    const sizes = [2.5, -1, Number.NaN] as const;

    test.each(sizes)('throws when the type is built with $0', (size) => {
      expect(() => minLengthArray(size, number())).toThrow(TypeError);

      expect(() => minLengthTuple(size, number())).toThrow(TypeError);

      expect(() => maxLengthArray(size, number())).toThrow(TypeError);

      expect(() => maxLengthTuple(size, number())).toThrow(TypeError);

      expect(() => fixedLengthArray(size, number())).toThrow(TypeError);
    });

    test.each(sizes)(
      'throws when a bounded type is built with $0 as either bound',
      (size) => {
        expect(() => boundedLengthArray(size, 5, number())).toThrow(TypeError);

        expect(() => boundedLengthArray(0, size, number())).toThrow(TypeError);

        expect(() => boundedLengthTuple(size, 5, number())).toThrow(TypeError);

        expect(() => boundedLengthTuple(0, size, number())).toThrow(TypeError);
      },
    );
  });
});
