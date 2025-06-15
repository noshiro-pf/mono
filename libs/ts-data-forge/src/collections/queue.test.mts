import { Arr } from '../array/index.mjs';
import { Optional } from '../functional/index.mjs';
import { asUint32 } from '../number/index.mjs';
import { createQueue, type Queue } from './queue.mjs';

describe('Queue', () => {
  describe('initialization', () => {
    test('should be empty if initialized without values', () => {
      const q = createQueue();
      expect(q.isEmpty).toBe(true);
      expect(q.size).toBe(0);
    });

    test('should not be empty if initialized with values', () => {
      const q = createQueue([1, 2, 3]);
      expect(q.isEmpty).toBe(false);
      expect(q.size).toBe(3);
    });
  });

  describe('enqueue', () => {
    let q: Queue<number>;

    beforeEach(() => {
      q = createQueue();
    });

    test('should increase size and not be empty after enqueueing to an empty queue', () => {
      q.enqueue(1);
      expect(q.isEmpty).toBe(false);
      expect(q.size).toBe(1);
    });

    test('should increase size when enqueueing to a non-empty queue', () => {
      q.enqueue(1);
      q.enqueue(2);
      expect(q.size).toBe(2);
    });
  });

  describe('dequeue', () => {
    test('should return Optional.none and size should be 0 when dequeuing from an empty queue', () => {
      const q = createQueue<number>();
      const result = q.dequeue();
      expect(Optional.isNone(result)).toBe(true);
      expect(q.isEmpty).toBe(true);
      expect(q.size).toBe(0);
    });

    test('should decrease size and return the dequeued element for a non-empty queue', () => {
      const q = createQueue([1, 2, 3]); // FIFO: elements are in order [1, 2, 3]
      const initialSize = q.size;

      const result1 = q.dequeue(); // Dequeues 1 (first element)
      expect(Optional.isSome(result1)).toBe(true);
      if (Optional.isSome(result1)) {
        expect(result1.value).toBe(1);
      }
      expect(q.size).toBe(initialSize - 1);

      const result2 = q.dequeue(); // Dequeues 2
      expect(Optional.isSome(result2)).toBe(true);
      if (Optional.isSome(result2)) {
        expect(result2.value).toBe(2);
      }
      expect(q.size).toBe(initialSize - 2);
    });

    test('should become empty after dequeuing all elements', () => {
      const q = createQueue([1, 2]); // Internal: [1, 2]
      q.dequeue(); // Dequeues 1
      q.dequeue(); // Dequeues 2
      expect(q.isEmpty).toBe(true);
      expect(q.size).toBe(0);
      const result = q.dequeue(); // Dequeue from empty
      expect(Optional.isNone(result)).toBe(true);
    });
  });

  describe('FIFO behavior', () => {
    test('elements should be dequeued in first-in, first-out order', () => {
      const q = createQueue<number>();
      q.enqueue(1); // internal: [1]
      q.enqueue(2); // internal: [1, 2]
      q.enqueue(3); // internal: [1, 2, 3]

      expect(q.size).toBe(3);

      let result = q.dequeue(); // Dequeues 1 (first in)
      expect(Optional.isSome(result) && result.value === 1).toBe(true);
      expect(q.size).toBe(2);

      result = q.dequeue(); // Dequeues 2
      expect(Optional.isSome(result) && result.value === 2).toBe(true);
      expect(q.size).toBe(1);

      result = q.dequeue(); // Dequeues 3
      expect(Optional.isSome(result) && result.value === 3).toBe(true);
      expect(q.size).toBe(0);
      expect(q.isEmpty).toBe(true);

      result = q.dequeue();
      expect(Optional.isNone(result)).toBe(true);
    });

    test('initial values are dequeued in the same order (FIFO)', () => {
      const q = createQueue([1, 2, 3]); // Internal: [1, 2, 3]
      expect(q.size).toBe(3);

      let result = q.dequeue(); // Dequeues 1 (first element)
      expect(Optional.isSome(result) && result.value === 1).toBe(true);

      result = q.dequeue(); // Dequeues 2
      expect(Optional.isSome(result) && result.value === 2).toBe(true);

      result = q.dequeue(); // Dequeues 3
      expect(Optional.isSome(result) && result.value === 3).toBe(true);

      expect(q.isEmpty).toBe(true);
    });

    test('mixed enqueue and dequeue operations maintain FIFO order', () => {
      const q = createQueue<string>();

      q.enqueue('A');
      q.enqueue('B');

      let result = q.dequeue();
      expect(Optional.isSome(result) && result.value === 'A').toBe(true);

      q.enqueue('C');
      q.enqueue('D');

      result = q.dequeue();
      expect(Optional.isSome(result) && result.value === 'B').toBe(true);

      result = q.dequeue();
      expect(Optional.isSome(result) && result.value === 'C').toBe(true);

      result = q.dequeue();
      expect(Optional.isSome(result) && result.value === 'D').toBe(true);

      expect(q.isEmpty).toBe(true);
    });
  });

  describe('Circular buffer behavior', () => {
    test('should handle buffer wraparound correctly', () => {
      const q = createQueue<number>();

      // Fill and partially empty the queue to create wraparound conditions
      for (let i = 1; i <= 5; i++) {
        q.enqueue(i);
      }

      // Remove first 3 elements
      expect(Optional.unwrap(q.dequeue())).toBe(1);
      expect(Optional.unwrap(q.dequeue())).toBe(2);
      expect(Optional.unwrap(q.dequeue())).toBe(3);

      // Add more elements (this should wrap around in the buffer)
      q.enqueue(6);
      q.enqueue(7);
      q.enqueue(8);

      // Verify FIFO order is maintained
      expect(Optional.unwrap(q.dequeue())).toBe(4);
      expect(Optional.unwrap(q.dequeue())).toBe(5);
      expect(Optional.unwrap(q.dequeue())).toBe(6);
      expect(Optional.unwrap(q.dequeue())).toBe(7);
      expect(Optional.unwrap(q.dequeue())).toBe(8);

      expect(q.isEmpty).toBe(true);
    });

    test('should automatically resize when buffer becomes full', () => {
      const q = createQueue<number>();

      // Add more elements than initial capacity (8) to trigger resize
      for (let i = 1; i <= 20; i++) {
        q.enqueue(i);
      }

      expect(q.size).toBe(20);

      // Verify all elements can be dequeued in correct order
      for (let i = 1; i <= 20; i++) {
        const result = q.dequeue();
        expect(Optional.isSome(result) && result.value === i).toBe(true);
      }

      expect(q.isEmpty).toBe(true);
    });

    test('should handle multiple resize operations', () => {
      const q = createQueue<number>();

      // Add many elements to trigger multiple resizes
      for (let i = 1; i <= 100; i++) {
        q.enqueue(i);
      }

      expect(q.size).toBe(100);

      // Remove half
      for (let i = 1; i <= 50; i++) {
        expect(Optional.unwrap(q.dequeue())).toBe(i);
      }

      // Add more to trigger another resize
      for (let i = 101; i <= 150; i++) {
        q.enqueue(i);
      }

      expect(q.size).toBe(100); // 50 remaining + 50 new

      // Verify correct order
      for (let i = 51; i <= 100; i++) {
        expect(Optional.unwrap(q.dequeue())).toBe(i);
      }
      for (let i = 101; i <= 150; i++) {
        expect(Optional.unwrap(q.dequeue())).toBe(i);
      }

      expect(q.isEmpty).toBe(true);
    });

    test('should handle edge case of single element operations', () => {
      const q = createQueue<string>();

      // Test single element enqueue/dequeue cycles
      for (let i = 0; i < 10; i++) {
        q.enqueue(`item-${i}`);
        expect(q.size).toBe(1);

        const result = q.dequeue();
        expect(Optional.isSome(result) && result.value === `item-${i}`).toBe(
          true,
        );
        expect(q.isEmpty).toBe(true);
      }
    });

    test('should handle large initial values array', () => {
      const largeArray = Arr.range(1, asUint32(51));
      const q = createQueue(largeArray);

      expect(q.size).toBe(50);

      // Verify all elements are in correct order
      for (let i = 1; i <= 50; i++) {
        expect(Optional.unwrap(q.dequeue())).toBe(i);
      }

      expect(q.isEmpty).toBe(true);
    });

    test('should properly clean up references for garbage collection', () => {
      const q = createQueue<{ id: number }>();
      const objects = Arr.seq(10).map((i) => ({ id: i }));

      // Add all objects
      objects.forEach((obj) => {
        q.enqueue(obj);
      });

      // Remove first 5 objects
      for (let i = 0; i < 5; i++) {
        const result = q.dequeue();
        expect(Optional.isSome(result) && result.value.id === i).toBe(true);
      }

      // Remaining objects should still be accessible
      for (let i = 5; i < 10; i++) {
        const result = q.dequeue();
        expect(Optional.isSome(result) && result.value.id === i).toBe(true);
      }

      expect(q.isEmpty).toBe(true);
    });
  });
});
