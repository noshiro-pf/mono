// Example: src/array/array-utils.mts (isArrayAtLeastLength)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const queue: readonly string[] = ['task-1', 'task-2'] as const;

    const emptyQueue: readonly string[] = [] as const;

    assert.isTrue(Arr.isArrayAtLeastLength(queue, 1));

    assert.isFalse(Arr.isArrayAtLeastLength(emptyQueue, 1));

    if (Arr.isArrayAtLeastLength(queue, 1)) {
      assert.isTrue(queue[0] === 'task-1');
    }

    // embed-sample-code-ignore-below
  });
}
