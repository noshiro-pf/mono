// Example: src/array/array-utils.mts (isMinLengthTuple)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const queue: readonly string[] = ['task-1', 'task-2'] as const;

    const emptyQueue: readonly string[] = [] as const;

    assert.isTrue(Arr.isMinLengthTuple(queue, 1));

    assert.isFalse(Arr.isMinLengthTuple(emptyQueue, 1));

    if (Arr.isMinLengthTuple(queue, 1)) {
      assert.isTrue(queue[0] === 'task-1');
    }

    // embed-sample-code-ignore-below
  });
}
