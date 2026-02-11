/* eslint-disable ts-data-forge/prefer-arr-is-array-of-length */
// Example: src/array/array-utils.mts (butLast)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const queue = ['task-1', 'task-2', 'task-3'] as const;

    const withoutLast = Arr.butLast(queue);

    assert.deepStrictEqual(withoutLast, ['task-1', 'task-2']);

    assert.isTrue(withoutLast.length === 2);

    // embed-sample-code-ignore-below
  });
}
