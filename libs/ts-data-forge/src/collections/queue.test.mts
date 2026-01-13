import { Arr } from '../array/index.mjs';
import { Optional } from '../functional/index.mjs';
import { range } from '../iterator/index.mjs';
import { asUint32, Uint32 } from '../number/index.mjs';
import { createQueue, type Queue } from './queue.mjs';

describe('Queue test', () => {
  describe('initialization', () => {
    test('should be empty if initialized without values', () => {
      const q = createQueue();

      assert.isTrue(q.isEmpty);

      expect(q.size).toBe(0);
    });

    test('should not be empty if initialized with values', () => {
      const q = createQueue([1, 2, 3]);

      assert.isFalse(q.isEmpty);

      expect(q.size).toBe(3);
    });
  });

  describe('enqueue', () => {
    let mut_q: Queue<number>;

    // eslint-disable-next-line vitest/no-hooks
    beforeEach(() => {
      mut_q = createQueue();
    });

    test('should increase size and not be empty after enqueueing to an empty queue', () => {
      mut_q.enqueue(1);

      assert.isFalse(mut_q.isEmpty);

      expect(mut_q.size).toBe(1);
    });

    test('should increase size when enqueueing to a non-empty queue', () => {
      mut_q.enqueue(1);

      mut_q.enqueue(2);

      expect(mut_q.size).toBe(2);
    });
  });

  describe('dequeue', () => {
    test('should return Optional.none and size should be 0 when dequeuing from an empty queue', () => {
      const q = createQueue<number>();

      const result = q.dequeue();

      assert.isTrue(Optional.isNone(result));

      assert.isTrue(q.isEmpty);

      expect(q.size).toBe(0);
    });

    test('should decrease size and return the dequeued element for a non-empty queue', () => {
      const q = createQueue([1, 2, 3]); // FIFO: elements are in order [1, 2, 3]

      const initialSize = q.size;

      const result1 = q.dequeue(); // Dequeues 1 (first element)

      assert.isTrue(Optional.isSome(result1));

      if (Optional.isSome(result1)) {
        expect(result1.value).toBe(1);
      }

      expect(q.size).toBe(initialSize - 1);

      const result2 = q.dequeue(); // Dequeues 2

      assert.isTrue(Optional.isSome(result2));

      if (Optional.isSome(result2)) {
        expect(result2.value).toBe(2);
      }

      expect(q.size).toBe(initialSize - 2);
    });

    test('should become empty after dequeuing all elements', () => {
      const q = createQueue([1, 2]); // Internal: [1, 2]

      q.dequeue(); // Dequeues 1

      q.dequeue(); // Dequeues 2

      assert.isTrue(q.isEmpty);

      expect(q.size).toBe(0);

      const result = q.dequeue(); // Dequeue from empty

      assert.isTrue(Optional.isNone(result));
    });
  });

  describe('FIFO behavior', () => {
    test('elements should be dequeued in first-in, first-out order', () => {
      const q = createQueue<number>();

      q.enqueue(1); // internal: [1]

      q.enqueue(2); // internal: [1, 2]

      q.enqueue(3); // internal: [1, 2, 3]

      expect(q.size).toBe(3);

      let mut_result = q.dequeue(); // Dequeues 1 (first in)

      assert.isTrue(Optional.isSome(mut_result) && mut_result.value === 1);

      expect(q.size).toBe(2);

      mut_result = q.dequeue(); // Dequeues 2

      assert.isTrue(Optional.isSome(mut_result) && mut_result.value === 2);

      expect(q.size).toBe(1);

      mut_result = q.dequeue(); // Dequeues 3

      assert.isTrue(Optional.isSome(mut_result) && mut_result.value === 3);

      expect(q.size).toBe(0);

      assert.isTrue(q.isEmpty);

      mut_result = q.dequeue();

      assert.isTrue(Optional.isNone(mut_result));
    });

    test('initial values are dequeued in the same order (FIFO)', () => {
      const q = createQueue([1, 2, 3]); // Internal: [1, 2, 3]

      expect(q.size).toBe(3);

      const result1 = q.dequeue(); // Dequeues 1 (first element)

      assert.isTrue(Optional.isSome(result1) && result1.value === 1);

      const result2 = q.dequeue(); // Dequeues 2

      assert.isTrue(Optional.isSome(result2) && result2.value === 2);

      const result3 = q.dequeue(); // Dequeues 3

      assert.isTrue(Optional.isSome(result3) && result3.value === 3);

      assert.isTrue(q.isEmpty);
    });

    test('mixed enqueue and dequeue operations maintain FIFO order', () => {
      const q = createQueue<string>();

      q.enqueue('A');

      q.enqueue('B');

      const result1 = q.dequeue();

      assert.isTrue(Optional.isSome(result1) && result1.value === 'A');

      q.enqueue('C');

      q.enqueue('D');

      const result2 = q.dequeue();

      assert.isTrue(Optional.isSome(result2) && result2.value === 'B');

      const result3 = q.dequeue();

      assert.isTrue(Optional.isSome(result3) && result3.value === 'C');

      const result4 = q.dequeue();

      assert.isTrue(Optional.isSome(result4) && result4.value === 'D');

      assert.isTrue(q.isEmpty);
    });
  });

  describe('Circular buffer behavior', () => {
    test('should handle buffer wraparound correctly', () => {
      const q = createQueue<number>();

      // Fill and partially empty the queue to create wraparound conditions
      for (const i of range(1, 6)) {
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

      assert.isTrue(q.isEmpty);
    });

    test('should handle tail wrapping around to index 0', () => {
      const q = createQueue<number>();

      // Initial capacity is 8, fill up to 7 elements (leaving one space)
      for (const i of range(1, 8)) {
        q.enqueue(i);
      }

      // Dequeue 3 elements to move head forward
      expect(Optional.unwrap(q.dequeue())).toBe(1);

      expect(Optional.unwrap(q.dequeue())).toBe(2);

      expect(Optional.unwrap(q.dequeue())).toBe(3);

      // Now head=3, tail=7, size=4
      // Add one more element - tail should wrap to 0
      q.enqueue(8);

      // tail is now 0, head is 3
      // Add more to confirm wraparound works
      q.enqueue(9);

      q.enqueue(10);

      // Verify all elements in correct order
      expect(Optional.unwrap(q.dequeue())).toBe(4);

      expect(Optional.unwrap(q.dequeue())).toBe(5);

      expect(Optional.unwrap(q.dequeue())).toBe(6);

      expect(Optional.unwrap(q.dequeue())).toBe(7);

      expect(Optional.unwrap(q.dequeue())).toBe(8);

      expect(Optional.unwrap(q.dequeue())).toBe(9);

      expect(Optional.unwrap(q.dequeue())).toBe(10);

      assert.isTrue(q.isEmpty);
    });

    test('should handle head wrapping around to index 0', () => {
      const q = createQueue<number>();

      // Fill to capacity-1, dequeue all, then add one
      for (const i of range(1, 8)) {
        q.enqueue(i);
      }

      // Dequeue all to move head to index 7
      for (const i of range(1, 8)) {
        expect(Optional.unwrap(q.dequeue())).toBe(i);
      }

      // Now head=7, tail=7, size=0
      // Add element - tail becomes 0 (wrapped)
      q.enqueue(100);

      // Add more elements
      q.enqueue(101);

      q.enqueue(102);

      // Dequeue all - head should wrap from 7 to 0 to 1 to 2
      expect(Optional.unwrap(q.dequeue())).toBe(100);

      expect(Optional.unwrap(q.dequeue())).toBe(101);

      expect(Optional.unwrap(q.dequeue())).toBe(102);

      assert.isTrue(q.isEmpty);
    });

    test('should handle filling buffer to exact capacity', () => {
      const q = createQueue<number>();

      // Initial capacity is 8, fill exactly 8 elements
      for (const i of range(1, 9)) {
        q.enqueue(i);
      }

      expect(q.size).toBe(8);

      // This should trigger resize
      q.enqueue(9);

      expect(q.size).toBe(9);

      // Verify all elements are in correct order
      for (const i of range(1, 10)) {
        expect(Optional.unwrap(q.dequeue())).toBe(i);
      }

      assert.isTrue(q.isEmpty);
    });

    test('should correctly resize when head is not at index 0', () => {
      const q = createQueue<number>();

      // Fill buffer
      for (const i of range(1, 9)) {
        q.enqueue(i);
      }

      // Dequeue some to move head forward
      expect(Optional.unwrap(q.dequeue())).toBe(1);

      expect(Optional.unwrap(q.dequeue())).toBe(2);

      expect(Optional.unwrap(q.dequeue())).toBe(3);

      // Now head=3, tail=0 (wrapped), size=5
      // Add elements until we need to resize
      q.enqueue(9);

      q.enqueue(10);

      q.enqueue(11);

      // Now buffer is full again (size=8), next enqueue triggers resize
      q.enqueue(12); // Triggers resize with head != 0

      expect(q.size).toBe(9);

      // Verify correct order after resize
      for (const i of range(4, 13)) {
        expect(Optional.unwrap(q.dequeue())).toBe(i);
      }

      assert.isTrue(q.isEmpty);
    });

    test('should handle alternating enqueue/dequeue cycles with wraparound', () => {
      const q = createQueue<number>();

      let mut_counter = 0;

      // Perform multiple cycles of filling and partial emptying
      for (const _cycle of range(5)) {
        // Add 10 elements
        for (const _i of range(10)) {
          mut_counter += 1;

          q.enqueue(mut_counter);
        }

        // Remove 7 elements
        for (const _i of range(7)) {
          q.dequeue();
        }
      }

      // Queue should have 15 elements remaining (5 cycles * 3 net adds)
      expect(q.size).toBe(15);

      // Verify remaining elements are in correct order
      for (const i of range(36, 51)) {
        expect(Optional.unwrap(q.dequeue())).toBe(i);
      }

      assert.isTrue(q.isEmpty);
    });

    test('should automatically resize when buffer becomes full', () => {
      const q = createQueue<number>();

      // Add more elements than initial capacity (8) to trigger resize
      for (const i of range(1, 21)) {
        q.enqueue(i);
      }

      expect(q.size).toBe(20);

      // Verify all elements can be dequeued in correct order
      for (const i of range(1, 21)) {
        const result = q.dequeue();

        assert.isTrue(Optional.isSome(result) && result.value === i);
      }

      assert.isTrue(q.isEmpty);
    });

    test('should handle multiple resize operations', () => {
      const q = createQueue<number>();

      // Add many elements to trigger multiple resizes
      for (const i of range(1, 101)) {
        q.enqueue(i);
      }

      expect(q.size).toBe(100);

      // Remove half
      for (const i of range(1, 51)) {
        expect(Optional.unwrap(q.dequeue())).toBe(i);
      }

      // Add more to trigger another resize
      for (const i of range(101, 151)) {
        q.enqueue(i);
      }

      expect(q.size).toBe(100); // 50 remaining + 50 new

      // Verify correct order
      for (const i of range(51, 101)) {
        expect(Optional.unwrap(q.dequeue())).toBe(i);
      }

      for (const i of range(101, 151)) {
        expect(Optional.unwrap(q.dequeue())).toBe(i);
      }

      assert.isTrue(q.isEmpty);
    });

    test('should handle edge case of single element operations', () => {
      const q = createQueue<string>();

      // Test single element enqueue/dequeue cycles
      for (const i of range(10)) {
        q.enqueue(`item-${i}`);

        expect(q.size).toBe(1);

        const result = q.dequeue();

        assert.isTrue(Optional.isSome(result) && result.value === `item-${i}`);

        assert.isTrue(q.isEmpty);
      }
    });

    test('should handle large initial values array', () => {
      const largeArray = Arr.range(1, asUint32(51));

      const q = createQueue(largeArray);

      expect(q.size).toBe(50);

      // Verify all elements are in correct order
      for (const i of range(1, 51)) {
        expect(Optional.unwrap(q.dequeue())).toBe(i);
      }

      assert.isTrue(q.isEmpty);
    });

    test('should properly clean up references for garbage collection', () => {
      const q = createQueue<{ id: number }>();

      const objects = Arr.seq(10).map((i) => ({ id: i }));

      // Add all objects
      for (const obj of objects) {
        q.enqueue(obj);
      }

      // Remove first 5 objects
      for (const i of range(0, 5)) {
        const result = q.dequeue();

        assert.isTrue(Optional.isSome(result) && result.value.id === i);
      }

      // Remaining objects should still be accessible
      for (const i of range(5, 10)) {
        const result = q.dequeue();

        assert.isTrue(Optional.isSome(result) && result.value.id === i);
      }

      assert.isTrue(q.isEmpty);
    });
  });

  describe('Large-scale operations', () => {
    test('should handle 1000 elements enqueue/dequeue correctly', () => {
      const q = createQueue<number>();

      const elementCount = asUint32(1000);

      // Enqueue 1000 elements
      for (const i of range(1, Uint32.add(elementCount, 1))) {
        q.enqueue(i);
      }

      expect(q.size).toBe(elementCount);

      // Dequeue all elements and verify order
      for (const i of range(1, Uint32.add(elementCount, 1))) {
        const result = q.dequeue();

        assert.isTrue(Optional.isSome(result) && result.value === i);
      }

      assert.isTrue(q.isEmpty);
    });

    test('should handle mixed operations with 1000 elements', () => {
      const q = createQueue<number>();

      const mut_expected: number[] = [];

      // Pattern: enqueue 5, dequeue 3, repeat
      for (const cycle of range(200)) {
        const baseValue = cycle * 5;

        // Enqueue 5 elements
        for (const offset of range(5)) {
          const value = baseValue + offset + 1;

          q.enqueue(value);

          mut_expected.push(value);
        }

        // Dequeue 3 elements
        for (const _i of range(3)) {
          const result = q.dequeue();

          const expected = mut_expected.shift();

          assert.isTrue(
            Optional.isSome(result) &&
              expected !== undefined &&
              result.value === expected,
          );
        }
      }

      // Verify remaining elements
      expect(q.size).toBe(mut_expected.length);

      for (const expected of mut_expected) {
        const result = q.dequeue();

        assert.isTrue(Optional.isSome(result) && result.value === expected);
      }

      assert.isTrue(q.isEmpty);
    });

    test('should handle stress test with random operations', () => {
      const q = createQueue<number>();

      const mut_expected: number[] = [];

      let mut_counter = 0;

      // Perform 1000 random operations
      for (const _i of range(asUint32(1000))) {
        // Randomly decide to enqueue or dequeue
        const shouldEnqueue = mut_expected.length === 0 || Math.random() < 0.6;

        if (shouldEnqueue) {
          mut_counter += 1;

          q.enqueue(mut_counter);

          mut_expected.push(mut_counter);
        } else {
          const result = q.dequeue();

          const expected = mut_expected.shift();

          assert.isTrue(
            Optional.isSome(result) &&
              expected !== undefined &&
              result.value === expected,
          );
        }
      }

      // Verify final state
      expect(q.size).toBe(mut_expected.length);

      // Drain remaining elements
      for (const expected of mut_expected) {
        const result = q.dequeue();

        assert.isTrue(Optional.isSome(result) && result.value === expected);
      }

      assert.isTrue(q.isEmpty);
    });

    test('should handle large initial values array', () => {
      const largeArray = Arr.range(1, asUint32(1001));

      const q = createQueue(largeArray);

      expect(q.size).toBe(1000);

      // Verify all elements in correct order
      for (const i of range(1, asUint32(1001))) {
        const result = q.dequeue();

        assert.isTrue(Optional.isSome(result) && result.value === i);
      }

      assert.isTrue(q.isEmpty);
    });
  });
});
