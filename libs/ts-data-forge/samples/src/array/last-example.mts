// Example: src/array/array-utils.mts (last)
import { Arr, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const queue = ['first', 'second'] as const;

    const emptyQueue: readonly string[] = [] as const;

    const lastValue = Arr.last(queue);

    const none = Arr.last(emptyQueue);

    assert.deepStrictEqual(lastValue, Optional.some('second'));

    assert.deepStrictEqual(none, Optional.none);

    // embed-sample-code-ignore-below
  });
}
