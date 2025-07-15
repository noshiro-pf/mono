import { expectType } from '../expect-type.mjs';
import { Optional } from '../functional/index.mjs';
import { range } from '../iterator/index.mjs';
import { asPositiveSafeInt, asSafeInt } from '../number/index.mjs';
import { createStack, type Stack } from './stack.mjs';

describe('Stack', () => {
  test('should have correct type definitions', () => {
    const stack = createStack<number>();

    expectType<typeof stack, Stack<number>>('=');
    expectType<typeof stack.isEmpty, boolean>('=');
    expectType<typeof stack.size, SizeType.Arr>('=');
    expectType<typeof stack.pop, () => Optional<number>>('=');
    expectType<typeof stack.push, (value: number) => void>('=');

    // Verify the type checking works at runtime too
    expect(typeof stack.isEmpty).toBe('boolean');
    expect(typeof stack.size).toBe('number');
    expect(typeof stack.pop).toBe('function');
    expect(typeof stack.push).toBe('function');
  });

  test('should be empty when created without initial values', () => {
    const stack = createStack<string>();

    expect(stack.isEmpty).toBe(true);
    expect(stack.size).toBe(0);
  });

  test('should create with initial values', () => {
    const stack = createStack<number>([1, 2, 3]);

    expect(stack.isEmpty).toBe(false);
    expect(stack.size).toBe(3);

    // Last element should be on top (LIFO)
    expect(Optional.unwrap(stack.pop())).toBe(3);
    expect(Optional.unwrap(stack.pop())).toBe(2);
    expect(Optional.unwrap(stack.pop())).toBe(1);
    expect(stack.isEmpty).toBe(true);
  });

  test('should implement LIFO behavior correctly', () => {
    const stack = createStack<string>();

    stack.push('first');
    stack.push('second');
    stack.push('third');

    expect(stack.size).toBe(3);
    expect(stack.isEmpty).toBe(false);

    // LIFO: Last In, First Out
    expect(Optional.unwrap(stack.pop())).toBe('third');
    expect(Optional.unwrap(stack.pop())).toBe('second');
    expect(Optional.unwrap(stack.pop())).toBe('first');

    expect(stack.isEmpty).toBe(true);
    expect(stack.size).toBe(0);
  });

  test('should return none when popping from empty stack', () => {
    const stack = createStack<number>();

    const result = stack.pop();
    expect(Optional.isNone(result)).toBe(true);
    expect(stack.isEmpty).toBe(true);
    expect(stack.size).toBe(0);
  });

  test('should maintain size correctly during operations', () => {
    const stack = createStack<number>();

    expect(stack.size).toBe(0);

    stack.push(1);
    expect(stack.size).toBe(1);

    stack.push(2);
    expect(stack.size).toBe(2);

    stack.push(3);
    expect(stack.size).toBe(3);

    Optional.unwrap(stack.pop());
    expect(stack.size).toBe(2);

    Optional.unwrap(stack.pop());
    expect(stack.size).toBe(1);

    Optional.unwrap(stack.pop());
    expect(stack.size).toBe(0);
    expect(stack.isEmpty).toBe(true);
  });

  test('should handle mixed push and pop operations', () => {
    const stack = createStack<string>();

    stack.push('a');
    stack.push('b');
    expect(Optional.unwrap(stack.pop())).toBe('b');

    stack.push('c');
    stack.push('d');
    expect(Optional.unwrap(stack.pop())).toBe('d');
    expect(Optional.unwrap(stack.pop())).toBe('c');
    expect(Optional.unwrap(stack.pop())).toBe('a');

    expect(stack.isEmpty).toBe(true);
  });

  test('should work with object types', () => {
    type Item = Readonly<{ id: number; name: string }>;
    const stack = createStack<Item>();

    const item1: Item = { id: 1, name: 'first' };
    const item2: Item = { id: 2, name: 'second' };

    stack.push(item1);
    stack.push(item2);

    expect(Optional.unwrap(stack.pop())).toStrictEqual(item2);
    expect(Optional.unwrap(stack.pop())).toStrictEqual(item1);
    expect(stack.isEmpty).toBe(true);
  });

  test('should handle large number of operations efficiently', () => {
    const stack = createStack<number>();
    const n = asPositiveSafeInt(10000);

    // Push many elements
    for (const i of range(n)) {
      stack.push(i);
    }

    expect(stack.size).toBe(n);
    expect(stack.isEmpty).toBe(false);

    // Pop all elements and verify LIFO order
    for (const i of range(asSafeInt(n - 1), -1, -1)) {
      const result = stack.pop();
      expect(Optional.isSome(result)).toBe(true);
      expect(Optional.unwrap(result)).toBe(i);
    }

    expect(stack.isEmpty).toBe(true);
    expect(stack.size).toBe(0);
  });

  test('should not mutate initial values array', () => {
    const initialValues = [1, 2, 3];
    const originalLength = initialValues.length;

    const stack = createStack(initialValues);

    // Modify stack
    stack.push(4);
    Optional.unwrap(stack.pop());

    // Original array should be unchanged
    expect(initialValues).toHaveLength(originalLength);
    expect(initialValues).toStrictEqual([1, 2, 3]);
  });

  test('should work with undefined and null values', () => {
    const stack = createStack<string | null | undefined>();

    stack.push('value');
    stack.push(null);
    stack.push(undefined);
    stack.push('another');

    expect(Optional.unwrap(stack.pop())).toBe('another');
    expect(Optional.unwrap(stack.pop())).toBeUndefined();
    expect(Optional.unwrap(stack.pop())).toBeNull();
    expect(Optional.unwrap(stack.pop())).toBe('value');
    expect(stack.isEmpty).toBe(true);
  });

  test('should maintain performance characteristics', () => {
    const stack = createStack<number>();

    // Test that operations are efficient even with many elements
    const startTime = performance.now();

    // Push operations should be O(1) amortized
    for (const i of range(511)) {
      stack.push(i);
    }

    // Pop operations should be O(1)
    while (!stack.isEmpty) {
      stack.pop();
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete in reasonable time (much less than 100ms for 512 operations)
    expect(duration).toBeLessThan(100);
  });

  test('should handle alternating push/pop operations', () => {
    const stack = createStack<number>();

    for (const i of range(100)) {
      stack.push(i);
      if (i % 2 === 1) {
        // Pop every other time
        const result = stack.pop();
        expect(Optional.unwrap(result)).toBe(i);
      }
    }

    // Should have 50 elements remaining (0, 2, 4, ..., 98)
    expect(stack.size).toBe(50);

    // Verify elements are in correct LIFO order
    for (const i of range(98, -1, -2)) {
      const result = stack.pop();
      expect(Optional.unwrap(result)).toBe(i);
    }

    expect(stack.isEmpty).toBe(true);
  });
});
