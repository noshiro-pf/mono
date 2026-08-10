// Example: src/array/array-utils.mts (isMinLengthTuple)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const queue: readonly string[] = ['task-1', 'task-2'] as const;

    const emptyQueue: readonly string[] = [] as const;

    assert.isTrue(Arr.isMinLengthTuple(1, queue));

    assert.isFalse(Arr.isMinLengthTuple(1, emptyQueue));

    if (Arr.isMinLengthTuple(1, queue)) {
      assert.isTrue(queue[0] === 'task-1');
    }

    // embed-sample-code-ignore-below
  });
}
