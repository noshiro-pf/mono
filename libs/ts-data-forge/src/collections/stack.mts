import { Arr } from '../array/index.mjs';
import { Optional } from '../functional/index.mjs';
import { asUint32 } from '../number/index.mjs';
import { castMutable } from '../others/index.mjs';

/**
 * Interface for a high-performance stack with LIFO (Last-In, First-Out) behavior.
 *
 * This interface defines a mutable stack data structure where elements are added to and removed
 * from the top, following the Last-In, First-Out principle. The implementation uses a dynamic
 * array for optimal performance, providing O(1) operations for both push and pop operations.
 *
 * **LIFO Behavior:**
 * - **push**: Adds elements to the top of the stack
 * - **pop**: Removes and returns elements from the top of the stack
 * - The last element added is the first element to be removed
 *
 * **Performance Characteristics:**
 * - push: O(1) amortized (O(n) when buffer needs resizing)
 * - pop: O(1) always
 * - size/isEmpty: O(1) always
 * - Memory efficient with automatic garbage collection of removed elements
 *
 * **Use Cases:**
 * - Function call management and recursion
 * - Undo/redo functionality
 * - Expression evaluation and parsing
 * - Depth-first search algorithms
 * - Backtracking algorithms
 * - Browser history management
 *
 * @template T The type of elements stored in the stack.
 *
 * @example
 * ```typescript
 * import { createStack, Stack } from './stack';
 *
 * // Example 1: Basic LIFO operations
 * const operationStack: Stack<string> = createStack<string>();
 *
 * operationStack.push("operation1");  // Add to top
 * operationStack.push("operation2");  // Add to top
 * operationStack.push("operation3");  // Add to top
 *
 * console.log(operationStack.size); // Output: 3
 *
 * // Process operations in LIFO order
 * console.log(operationStack.pop().unwrap()); // "operation3" (last in, first out)
 * console.log(operationStack.pop().unwrap()); // "operation2"
 * console.log(operationStack.size); // Output: 1
 *
 * // Example 2: Undo functionality
 * type Action = { type: string; data: any; timestamp: number };
 * const undoStack: Stack<Action> = createStack<Action>();
 *
 * undoStack.push({ type: "delete", data: { id: 123 }, timestamp: Date.now() });
 * undoStack.push({ type: "edit", data: { field: "name", oldValue: "old" }, timestamp: Date.now() });
 *
 * // Undo last action
 * if (!undoStack.isEmpty) {
 *   const lastAction = undoStack.pop().unwrap();
 *   console.log(`Undoing: ${lastAction.type}`);
 * }
 * ```
 */
export type Stack<T> = Readonly<{
  /** Checks if the stack is empty. */
  isEmpty: boolean;

  /** The number of elements in the stack. */
  size: SizeType.Arr;

  /**
   * Removes and returns the element at the top of the stack.
   * @returns The element at the top of the stack, or `Optional.none` if the stack is empty.
   */
  pop: () => Optional<T>;

  /**
   * Adds an element to the top of the stack.
   * @param value The element to add.
   */
  push: (value: T) => void;
}>;

/**
 * Class implementation for a stack with LIFO (Last-In, First-Out) behavior using a dynamic array.
 * This implementation provides O(1) amortized push and O(1) pop operations by using a resizable buffer
 * that grows as needed.
 *
 * The underlying array automatically resizes when it becomes full, ensuring that the stack
 * can grow to accommodate any number of elements while maintaining efficient operations.
 *
 * @template T The type of elements in the stack.
 * @implements Stack
 */
class StackClass<T> implements Stack<T> {
  /** @internal Dynamic array to store stack elements. */
  #buffer: (T | undefined)[];

  /** @internal Current number of elements in the stack. */
  #mut_size: number;

  /** @internal Current capacity of the buffer. */
  #capacity: number;

  /** @internal Initial capacity for new stacks. */
  static readonly #INITIAL_CAPACITY = 8;

  /**
   * Constructs a new StackClass instance.
   * @param initialValues Optional initial values to populate the stack.
   */
  constructor(initialValues: readonly T[] = []) {
    const initialCapacity = asUint32(
      Math.max(StackClass.#INITIAL_CAPACITY, initialValues.length * 2),
    );

    this.#buffer = castMutable(
      Arr.create<T | undefined>(initialCapacity, undefined),
    );
    this.#mut_size = 0;
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
   * This operation removes the element that was added most recently (last-in) and returns it.
   * If the stack is empty, returns `Optional.none`. The operation is guaranteed to be O(1)
   * and does not require any array resizing or memory reallocation.
   *
   * **Time Complexity:** O(1) - constant time operation
   * **Space Complexity:** O(1) - no additional memory allocation
   *
   * @returns An Optional containing the removed element, or `Optional.none` if the stack is empty.
   *
   * @example
   * ```typescript
   * const stack = createStack<string>();
   *
   * // Add some elements
   * stack.push("bottom");
   * stack.push("middle");
   * stack.push("top");
   *
   * // Remove elements in LIFO order
   * const top = stack.pop();
   * if (top.isSome) {
   *   console.log(top.value); // "top" (last pushed, first popped)
   * }
   *
   * const middle = stack.pop().unwrap(); // "middle"
   * console.log(stack.size); // 1
   *
   * // Safe handling of empty stack
   * const emptyStack = createStack<number>();
   * const result = emptyStack.pop();
   * if (result.isNone) {
   *   console.log("Stack is empty");
   * }
   *
   * // Typical usage in algorithms
   * const pathStack = createStack<string>();
   * pathStack.push("/home");
   * pathStack.push("/users");
   * pathStack.push("/documents");
   *
   * // Backtrack one level
   * const currentDir = pathStack.pop().unwrap(); // "/documents"
   * const parentDir = pathStack.pop().unwrap();  // "/users"
   * ```
   */
  pop(): Optional<T> {
    if (this.isEmpty) {
      return Optional.none;
    }

    this.#mut_size -= 1;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const element = this.#buffer[this.#mut_size]!;
    this.#buffer[this.#mut_size] = undefined; // Clear reference for garbage collection

    return Optional.some(element);
  }

  /**
   * Adds an element to the top of the stack (LIFO).
   *
   * This operation adds the element to the top of the stack, where it will be the first
   * to be popped (last-in, first-out ordering). The operation is amortized O(1),
   * meaning it's O(1) for most operations with occasional O(n) when the buffer needs resizing.
   *
   * **Time Complexity:** O(1) amortized - O(n) only when buffer resize is needed
   * **Space Complexity:** O(1) - constant additional memory per element
   *
   * **Buffer Resizing:** When the internal buffer becomes full, it automatically doubles
   * in size and copies existing elements to maintain the stack structure.
   *
   * @param value The element to add to the top of the stack.
   *
   * @example
   * ```typescript
   * const actionStack = createStack<string>();
   *
   * // Add actions in chronological order
   * actionStack.push("open file");        // O(1)
   * actionStack.push("edit content");     // O(1)
   * actionStack.push("save file");        // O(1)
   *
   * console.log(actionStack.size); // 3
   *
   * // Actions will be undone in reverse order (LIFO)
   * while (!actionStack.isEmpty) {
   *   const action = actionStack.pop().unwrap();
   *   console.log(`Undoing: ${action}`);
   * }
   * // Output:
   * // Undoing: save file
   * // Undoing: edit content
   * // Undoing: open file
   *
   * // High-volume pushing (demonstrates amortized O(1) performance)
   * const dataStack = createStack<number>();
   *
   * for (let i = 0; i < 1000000; i++) {
   *   dataStack.push(i); // Each operation is O(1) amortized
   * }
   *
   * console.log(dataStack.size); // 1000000
   *
   * // Function call stack simulation
   * type StackFrame = { function: string; variables: Record<string, any> };
   * const callStack = createStack<StackFrame>();
   *
   * callStack.push({ function: "main", variables: { argc: 1, argv: ["program"] } });
   * callStack.push({ function: "process", variables: { data: [1, 2, 3] } });
   * callStack.push({ function: "validate", variables: { input: "test" } });
   *
   * // Current function context is at the top
   * const currentFrame = callStack.pop().unwrap();
   * console.log(`Current function: ${currentFrame.function}`);
   * ```
   */
  push(value: T): void {
    // Resize if buffer is full
    if (this.#mut_size === this.#capacity) {
      this.#resize();
    }

    this.#buffer[this.#mut_size] = value;
    this.#mut_size += 1;
  }

  /**
   * @internal
   * Resizes the buffer when it becomes full.
   * Doubles the capacity while preserving all elements.
   */
  #resize(): void {
    const newCapacity = asUint32(this.#capacity * 2);
    const newBuffer = castMutable(
      Arr.create<T | undefined>(newCapacity, undefined),
    );

    // Copy existing elements
    for (let i = 0; i < this.#mut_size; i++) {
      newBuffer[i] = this.#buffer[i];
    }

    this.#buffer = newBuffer;
    this.#capacity = newCapacity;
  }
}

/**
 * Creates a new Stack instance with LIFO (Last-In, First-Out) behavior using a high-performance dynamic array.
 *
 * This factory function creates an optimized stack implementation that maintains excellent performance
 * characteristics for both push and pop operations. The underlying dynamic array automatically
 * resizes to accommodate growing workloads while providing predictable O(1) operations.
 *
 * **Implementation Features:**
 * - **O(1) push operations** (amortized - occasionally O(n) when resizing)
 * - **O(1) pop operations** (always)
 * - **Automatic buffer resizing** - starts at 8 elements, doubles when full
 * - **Memory efficient** - garbage collects removed elements immediately
 * - **Dynamic array design** - eliminates need for complex memory management
 *
 * **Performance Benefits:**
 * - No array shifting required for stack operations
 * - Minimal memory allocation overhead
 * - Predictable performance under high load
 * - Efficient memory usage with automatic cleanup
 *
 * @template T The type of elements stored in the stack.
 * @param initialValues Optional array of initial elements to populate the stack.
 *                      Elements will be popped in reverse order of how they appear in the array
 *                      (last array element will be popped first).
 *                      If provided, the initial buffer capacity will be at least twice the array length.
 * @returns A new Stack instance optimized for high-performance LIFO operations.
 *
 * @example
 * ```typescript
 * import { createStack } from './stack';
 *
 * // Example 1: Function call simulation
 * type FunctionCall = { name: string; args: any[]; context: any };
 * const callStack = createStack<FunctionCall>();
 *
 * // Simulate function calls (push onto stack)
 * callStack.push({ name: "main", args: [], context: {} });              // O(1)
 * callStack.push({ name: "processData", args: [data], context: {} });   // O(1)
 * callStack.push({ name: "validateInput", args: [input], context: {} }); // O(1)
 *
 * // Simulate function returns (pop from stack)
 * while (!callStack.isEmpty) {
 *   const call = callStack.pop().unwrap(); // O(1)
 *   console.log(`Returning from: ${call.name}`);
 * }
 * // Output:
 * // Returning from: validateInput
 * // Returning from: processData
 * // Returning from: main
 *
 * // Example 2: Expression evaluation with operator precedence
 * const operatorStack = createStack<string>();
 * const operandStack = createStack<number>();
 *
 * // Simulate parsing "3 + 4 * 2"
 * operandStack.push(3);
 * operatorStack.push("+");
 * operandStack.push(4);
 * operatorStack.push("*");  // Higher precedence
 * operandStack.push(2);
 *
 * // Process higher precedence first (LIFO)
 * const op = operatorStack.pop().unwrap(); // "*"
 * const b = operandStack.pop().unwrap();   // 2
 * const a = operandStack.pop().unwrap();   // 4
 * operandStack.push(a * b); // Push result: 8
 *
 * // Example 3: Undo/Redo functionality
 * type EditAction = {
 *   type: 'insert' | 'delete' | 'modify';
 *   position: number;
 *   oldValue: string;
 *   newValue: string;
 * };
 *
 * const undoStack = createStack<EditAction>();
 * const redoStack = createStack<EditAction>();
 *
 * // Perform edits (push to undo stack)
 * const edit1: EditAction = { type: 'insert', position: 0, oldValue: '', newValue: 'Hello' };
 * const edit2: EditAction = { type: 'insert', position: 5, oldValue: '', newValue: ' World' };
 *
 * undoStack.push(edit1);
 * undoStack.push(edit2);
 *
 * // Undo last edit
 * if (!undoStack.isEmpty) {
 *   const lastEdit = undoStack.pop().unwrap();
 *   redoStack.push(lastEdit);
 *   console.log(`Undid: ${lastEdit.type} at position ${lastEdit.position}`);
 * }
 *
 * // Example 4: High-throughput data processing
 * const processingStack = createStack<number>();
 *
 * // Add large amount of data (demonstrates amortized O(1) performance)
 * for (let i = 0; i < 100000; i++) {
 *   processingStack.push(i); // Each push is O(1) amortized
 * }
 *
 * // Process data in LIFO order
 * let processedCount = 0;
 * while (!processingStack.isEmpty) {
 *   const value = processingStack.pop().unwrap(); // O(1)
 *   // Process value...
 *   processedCount++;
 * }
 * console.log(`Processed ${processedCount} items`); // 100000
 *
 * // Example 5: Stack with pre-populated data
 * const historyStack = createStack<string>([
 *   "page1.html",
 *   "page2.html",
 *   "page3.html",
 *   "page4.html"
 * ]);
 *
 * console.log(historyStack.size); // Output: 4
 *
 * // Navigate back through history (LIFO order)
 * while (!historyStack.isEmpty) {
 *   const page = historyStack.pop().unwrap();
 *   console.log(`Going back to: ${page}`);
 * }
 * // Output:
 * // Going back to: page4.html (last added, first removed)
 * // Going back to: page3.html
 * // Going back to: page2.html
 * // Going back to: page1.html
 * ```
 */
export const createStack = <T,>(initialValues?: readonly T[]): Stack<T> =>
  new StackClass<T>(initialValues);
