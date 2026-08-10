// Example: src/array/array-utils.mts (toPushed)
import { Arr } from 'ts-data-forge';
import { type NonEmptyArray } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const base = [1, 2] as const;

    const appended = Arr.toPushed(base, 3);

    const appendedCurried = Arr.toPushed(4)(base);

    // The result is guaranteed non-empty, so it is assignable to NonEmptyArray.
    const nonEmpty: NonEmptyArray<number> = appended;

    assert.deepStrictEqual<readonly number[]>(appended, [1, 2, 3]);

    assert.deepStrictEqual<readonly number[]>(appendedCurried, [1, 2, 4]);

    assert.isTrue(nonEmpty.length >= 1);

    // embed-sample-code-ignore-below
  });
}
