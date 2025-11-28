import { Optional } from '../functional/index.mjs';
import { range } from '../iterator/index.mjs';
import { asUint32, Uint32 } from '../number/index.mjs';

/**
 * Interface for a high-performance stack with LIFO (Last-In, First-Out)
 * behavior.
 *
 * This interface defines a mutable stack data structure where elements are
 * added to and removed from the top, following the Last-In, First-Out
 * principle. The implementation uses a dynamic array for optimal performance,
 * providing O(1) operations for both push and pop operations.
 *
 * **LIFO Behavior:**
 *
 * - **push**: Adds elements to the top of the stack
 * - **pop**: Removes and returns elements from the top of the stack
 * - The last element added is the first element to be removed
 *
 * **Performance Characteristics:**
 *
 * - Push: O(1) amortized (O(n) when buffer needs resizing)
 * - Pop: O(1) always
 * - Size/isEmpty: O(1) always
 * - Memory efficient with automatic garbage collection of removed elements
 *
 * **Use Cases:**
 *
 * - Function call management and recursion
 * - Undo/redo functionality
 * - Expression evaluation and parsing
 * - Depth-first search algorithms
 * - Backtracking algorithms
 * - Browser history management
 *
 * @template T The type of elements stored in the stack.
 */
export type Stack<T> = Readonly<{
  /**
   * Checks if the stack is empty.
   *
   * @example
   *
   * ```ts
   * const stack = createStack<string>();
   *
   * assert.isTrue(stack.isEmpty);
   *
   * assert.isTrue(stack.size === 0);
   *
   * stack.push('first');
   *
   * // eslint-disable-next-line unicorn/prefer-single-call
   * stack.push('second');
   *
   * assert.isFalse(stack.isEmpty);
   *
   * assert.isTrue(stack.size === 2);
   *
   * assert.deepStrictEqual(stack.pop(), Optional.some('second'));
   *
   * assert.deepStrictEqual(stack.pop(), Optional.some('first'));
   *
   * assert.deepStrictEqual(stack.pop(), Optional.none);
   *
   * const seededStack = createStack([10, 20, 30]);
   *
   * assert.isTrue(seededStack.size === 3);
   *
   * assert.deepStrictEqual(seededStack.pop(), Optional.some(30));
   * ```
   */
  isEmpty: boolean;

  /**
   * The number of elements in the stack.
   *
   * @example
   *
   * ```ts
   * const stack = createStack<string>();
   *
   * assert.isTrue(stack.isEmpty);
   *
   * assert.isTrue(stack.size === 0);
   *
   * stack.push('first');
   *
   * // eslint-disable-next-line unicorn/prefer-single-call
   * stack.push('second');
   *
   * assert.isFalse(stack.isEmpty);
   *
   * assert.isTrue(stack.size === 2);
   *
   * assert.deepStrictEqual(stack.pop(), Optional.some('second'));
   *
   * assert.deepStrictEqual(stack.pop(), Optional.some('first'));
   *
   * assert.deepStrictEqual(stack.pop(), Optional.none);
   *
   * const seededStack = createStack([10, 20, 30]);
   *
   * assert.isTrue(seededStack.size === 3);
   *
   * assert.deepStrictEqual(seededStack.pop(), Optional.some(30));
   * ```
   */
  size: SizeType.Arr;

  /**
   * Removes and returns the element at the top of the stack.
   *
   * @example
   *
   * ```ts
   * const stack = createStack<string>();
   *
   * assert.isTrue(stack.isEmpty);
   *
   * assert.isTrue(stack.size === 0);
   *
   * stack.push('first');
   *
   * // eslint-disable-next-line unicorn/prefer-single-call
   * stack.push('second');
   *
   * assert.isFalse(stack.isEmpty);
   *
   * assert.isTrue(stack.size === 2);
   *
   * assert.deepStrictEqual(stack.pop(), Optional.some('second'));
   *
   * assert.deepStrictEqual(stack.pop(), Optional.some('first'));
   *
   * assert.deepStrictEqual(stack.pop(), Optional.none);
   *
   * const seededStack = createStack([10, 20, 30]);
   *
   * assert.isTrue(seededStack.size === 3);
   *
   * assert.deepStrictEqual(seededStack.pop(), Optional.some(30));
   * ```
   *
   * @returns The element at the top of the stack, or `Optional.none` if the
   *   stack is empty.
   */
  pop: () => Optional<T>;

  /**
   * Adds an element to the top of the stack.
   *
   * @example
   *
   * ```ts
   * const stack = createStack<string>();
   *
   * assert.isTrue(stack.isEmpty);
   *
   * assert.isTrue(stack.size === 0);
   *
   * stack.push('first');
   *
   * // eslint-disable-next-line unicorn/prefer-single-call
   * stack.push('second');
   *
   * assert.isFalse(stack.isEmpty);
   *
   * assert.isTrue(stack.size === 2);
   *
   * assert.deepStrictEqual(stack.pop(), Optional.some('second'));
   *
   * assert.deepStrictEqual(stack.pop(), Optional.some('first'));
   *
   * assert.deepStrictEqual(stack.pop(), Optional.none);
   *
   * const seededStack = createStack([10, 20, 30]);
   *
   * assert.isTrue(seededStack.size === 3);
   *
   * assert.deepStrictEqual(seededStack.pop(), Optional.some(30));
   * ```
   *
   * @param value The element to add.
   */
  push: (value: T) => void;
}>;

/**
 * Class implementation for a stack with LIFO (Last-In, First-Out) behavior
 * using a dynamic array. This implementation provides O(1) amortized push and
 * O(1) pop operations by using a resizable buffer that grows as needed.
 *
 * The underlying array automatically resizes when it becomes full, ensuring
 * that the stack can grow to accommodate any number of elements while
 * maintaining efficient operations.
 *
 * @template T The type of elements in the stack.
 * @implements Stack
 */
class StackClass<T> implements Stack<T> {
  /** @internal Dynamic array to store stack elements. */
  #buffer: (T | undefined)[];

  /** @internal Current number of elements in the stack. */
  #mut_size: Uint32;

  /** @internal Current capacity of the buffer. */
  #capacity: Uint32;

  /** @internal Initial capacity for new stacks. */
  static readonly #INITIAL_CAPACITY = 8;

  /**
   * Constructs a new StackClass instance.
   *
   * @param initialValues Optional initial values to populate the stack.
   */
  constructor(initialValues: readonly T[] = []) {
    const initialCapacity = asUint32(
      Math.max(StackClass.#INITIAL_CAPACITY, initialValues.length * 2),
    );

    this.#buffer = Array.from<unknown, T | undefined>(
      { length: initialCapacity },
      () => undefined,
    );

    this.#mut_size = asUint32(0);

    this.#capacity = initialCapacity;

    // Add initial values
    for (const value of initialValues) {
      this.push(value);
    }
  }

  /** @inheritdoc */
  get isEmpty(): boolean {
    return this.#mut_size === 0;
  }

  /** @inheritdoc */
  get size(): SizeType.Arr {
    return asUint32(this.#mut_size);
  }

  /**
   * Removes and returns the element at the top of the stack (LIFO).
   *
   * This operation removes the element that was added most recently (last-in)
   * and returns it. If the stack is empty, returns `Optional.none`. The
   * operation is guaranteed to be O(1) and does not require any array resizing
   * or memory reallocation.
   *
   * **Time Complexity:** O(1) - constant time operation **Space Complexity:**
   * O(1) - no additional memory allocation
   *
   * @returns An Optional containing the removed element, or `Optional.none` if
   *   the stack is empty.
   */
  pop(): Optional<T> {
    if (this.isEmpty) {
      return Optional.none;
    }

    this.#mut_size = Uint32.sub(this.#mut_size, 1);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const element = this.#buffer[this.#mut_size]!;

    this.#buffer[this.#mut_size] = undefined; // Clear reference for garbage collection

    return Optional.some(element);
  }

  /**
   * Adds an element to the top of the stack (LIFO).
   *
   * This operation adds the element to the top of the stack, where it will be
   * the first to be popped (last-in, first-out ordering). The operation is
   * amortized O(1), meaning it's O(1) for most operations with occasional O(n)
   * when the buffer needs resizing.
   *
   * **Time Complexity:** O(1) amortized - O(n) only when buffer resize is
   * needed **Space Complexity:** O(1) - constant additional memory per element
   *
   * **Buffer Resizing:** When the internal buffer becomes full, it
   * automatically doubles in size and copies existing elements to maintain the
   * stack structure.
   *
   * @param value The element to add to the top of the stack.
   */
  push(value: T): void {
    // Resize if buffer is full
    if (this.#mut_size === this.#capacity) {
      this.#resize();
    }

    this.#buffer[this.#mut_size] = value;

    this.#mut_size = Uint32.add(this.#mut_size, 1);
  }

  /**
   * @internal
   * Resizes the buffer when it becomes full.
   * Doubles the capacity while preserving all elements.
   */
  #resize(): void {
    const newCapacity = asUint32(this.#capacity * 2);

    const newBuffer = Array.from<unknown, T | undefined>(
      { length: newCapacity },
      () => undefined,
    );

    // Copy existing elements
    for (const i of range(this.#mut_size)) {
      newBuffer[i] = this.#buffer[i];
    }

    this.#buffer = newBuffer;

    this.#capacity = newCapacity;
  }
}

/**
 * Creates a new Stack instance with LIFO (Last-In, First-Out) behavior using a
 * high-performance dynamic array.
 *
 * This factory function creates an optimized stack implementation that
 * maintains excellent performance characteristics for both push and pop
 * operations. The underlying dynamic array automatically resizes to accommodate
 * growing workloads while providing predictable O(1) operations.
 *
 * **Implementation Features:**
 *
 * - **O(1) push operations** (amortized - occasionally O(n) when resizing)
 * - **O(1) pop operations** (always)
 * - **Automatic buffer resizing** - starts at 8 elements, doubles when full
 * - **Memory efficient** - garbage collects removed elements immediately
 * - **Dynamic array design** - eliminates need for complex memory management
 *
 * **Performance Benefits:**
 *
 * - No array shifting required for stack operations
 * - Minimal memory allocation overhead
 * - Predictable performance under high load
 * - Efficient memory usage with automatic cleanup
 *
 * @example
 *
 * ```ts
 * const stack = createStack<string>();
 *
 * assert.isTrue(stack.isEmpty);
 *
 * assert.isTrue(stack.size === 0);
 *
 * stack.push('first');
 *
 * // eslint-disable-next-line unicorn/prefer-single-call
 * stack.push('second');
 *
 * assert.isFalse(stack.isEmpty);
 *
 * assert.isTrue(stack.size === 2);
 *
 * assert.deepStrictEqual(stack.pop(), Optional.some('second'));
 *
 * assert.deepStrictEqual(stack.pop(), Optional.some('first'));
 *
 * assert.deepStrictEqual(stack.pop(), Optional.none);
 *
 * const seededStack = createStack([10, 20, 30]);
 *
 * assert.isTrue(seededStack.size === 3);
 *
 * assert.deepStrictEqual(seededStack.pop(), Optional.some(30));
 * ```
 *
 * @template T The type of elements stored in the stack.
 * @param initialValues Optional array of initial elements to populate the
 *   stack. Elements will be popped in reverse order of how they appear in the
 *   array (last array element will be popped first). If provided, the initial
 *   buffer capacity will be at least twice the array length.
 * @returns A new Stack instance optimized for high-performance LIFO operations.
 */
export const createStack = <T,>(initialValues?: readonly T[]): Stack<T> =>
  new StackClass<T>(initialValues);
