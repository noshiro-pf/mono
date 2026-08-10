// Example: src/collections/queue.mts (createQueue)
import { Optional, createQueue } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const queue = createQueue<number>();

    assert.isTrue(queue.isEmpty);

    assert.isTrue(queue.size === 0);

    queue.enqueue(1);

    queue.enqueue(2);

    assert.isFalse(queue.isEmpty);

    assert.isTrue(queue.size === 2);

    assert.deepStrictEqual(queue.dequeue(), Optional.some(1));

    assert.deepStrictEqual(queue.dequeue(), Optional.some(2));

    assert.deepStrictEqual(queue.dequeue(), Optional.none);

    const seededQueue = createQueue(['first', 'second']);

    assert.isTrue(seededQueue.size === 2);

    assert.deepStrictEqual(seededQueue.dequeue(), Optional.some('first'));

    assert.deepStrictEqual(seededQueue.dequeue(), Optional.some('second'));

    // embed-sample-code-ignore-below
  });
}
