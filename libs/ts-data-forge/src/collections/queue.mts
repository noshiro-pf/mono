import { Arr } from '../array/index.mjs';
import { Optional } from '../functional/index.mjs';
import { asUint32 } from '../number/index.mjs';
import { castMutable } from '../others/index.mjs';

/**
 * Interface for a high-performance queue with FIFO (First-In, First-Out) behavior.
 *
 * This interface defines a mutable queue data structure where elements are added to the back
 * and removed from the front, maintaining the order in which they were added. The implementation
 * uses a circular buffer for optimal performance, providing O(1) operations for both enqueue
 * and dequeue operations.
 *
 * **FIFO Behavior:**
 * - **enqueue**: Adds elements to the back of the queue
 * - **dequeue**: Removes and returns elements from the front of the queue
 * - Elements are processed in the exact order they were added
 *
 * **Performance Characteristics:**
 * - enqueue: O(1) amortized (O(n) when buffer needs resizing)
 * - dequeue: O(1) always
 * - size/isEmpty: O(1) always
 * - Memory efficient with automatic garbage collection of removed elements
 *
 * **Use Cases:**
 * - Task scheduling and job queues
 * - Breadth-first search algorithms
 * - Event processing systems
 * - Producer-consumer patterns
 * - Buffer management for streaming data
 *
 * @template T The type of elements stored in the queue.
 *
 * @example
 * ```typescript
 * import { createQueue, Queue } from './queue';
 *
 * // Example 1: Basic FIFO operations
 * const messageQueue: Queue<string> = createQueue<string>();
 *
 * messageQueue.enqueue("first message");   // Add to back
 * messageQueue.enqueue("second message");  // Add to back
 * messageQueue.enqueue("third message");   // Add to back
 *
 * console.log(messageQueue.size); // Output: 3
 *
 * // Process messages in FIFO order
 * console.log(messageQueue.dequeue().unwrap()); // "first message" (first in, first out)
 * console.log(messageQueue.dequeue().unwrap()); // "second message"
 * console.log(messageQueue.size); // Output: 1
 *
 * // Example 2: Task processing system
 * type Task = { id: number; priority: string; action: () => void };
 * const taskQueue: Queue<Task> = createQueue<Task>();
 *
 * taskQueue.enqueue({ id: 1, priority: "high", action: () => console.log("Task 1") });
 * taskQueue.enqueue({ id: 2, priority: "low", action: () => console.log("Task 2") });
 *
 * // Process tasks in order
 * while (!taskQueue.isEmpty) {
 *   const task = taskQueue.dequeue().unwrap();
 *   console.log(`Processing task ${task.id} with ${task.priority} priority`);
 *   task.action();
 * }
 * ```
 */
export type Queue<T> = Readonly<{
  /** Checks if the queue is empty. */
  isEmpty: boolean;

  /** The number of elements in the queue. */
  size: SizeType.Arr;

  /**
   * Removes and returns the element at the front of the queue.
   * @returns The element at the front of the queue, or `Optional.none` if the queue is empty.
   */
  dequeue: () => Optional<T>;

  /**
   * Adds an element to the back of the queue.
   * @param value The element to add.
   */
  enqueue: (value: T) => void;
}>;

/**
 * Class implementation for a queue with FIFO (First-In, First-Out) behavior using a circular buffer.
 * This implementation provides O(1) enqueue and dequeue operations by using a fixed-size buffer
 * with head and tail pointers that wrap around when they reach the buffer boundary.
 *
 * The circular buffer automatically resizes when it becomes full, ensuring that the queue
 * can grow to accommodate any number of elements while maintaining efficient operations.
 *
 * @template T The type of elements in the queue.
 * @implements Queue
 */
class QueueClass<T> implements Queue<T> {
  /** @internal Circular buffer to store queue elements. */
  #buffer: (T | undefined)[];

  /** @internal Index of the first element (front of queue). */
  #head: number;

  /** @internal Index where the next element will be added (back of queue). */
  #tail: number;

  /** @internal Current number of elements in the queue. */
  #mut_size: number;

  /** @internal Current capacity of the buffer. */
  #capacity: number;

  /** @internal Initial capacity for new queues. */
  static readonly #INITIAL_CAPACITY = 8;

  /**
   * Constructs a new QueueClass instance.
   * @param initialValues Optional initial values to populate the queue.
   */
  constructor(initialValues: readonly T[] = []) {
    const initialCapacity = asUint32(
      Math.max(QueueClass.#INITIAL_CAPACITY, initialValues.length * 2),
    );

    this.#buffer = castMutable(
      Arr.create<T | undefined>(initialCapacity, undefined),
    );
    this.#head = 0;
    this.#tail = 0;
    this.#mut_size = 0;
    this.#capacity = initialCapacity;

    // Add initial values
    for (const value of initialValues) {
      this.enqueue(value);
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
   * Removes and returns the element at the front of the queue (FIFO).
   *
   * This operation removes the element that was added earliest (first-in) and returns it.
   * If the queue is empty, returns `Optional.none`. The operation is guaranteed to be O(1)
   * and does not require any array shifting or copying.
   *
   * **Time Complexity:** O(1) - constant time operation
   * **Space Complexity:** O(1) - no additional memory allocation
   *
   * @returns An Optional containing the removed element, or `Optional.none` if the queue is empty.
   *
   * @example
   * ```typescript
   * const queue = createQueue<string>();
   *
   * // Add some elements
   * queue.enqueue("first");
   * queue.enqueue("second");
   * queue.enqueue("third");
   *
   * // Remove elements in FIFO order
   * const first = queue.dequeue();
   * if (first.isSome) {
   *   console.log(first.value); // "first"
   * }
   *
   * const second = queue.dequeue().unwrap(); // "second"
   * console.log(queue.size); // 1
   *
   * // Safe handling of empty queue
   * const emptyQueue = createQueue<number>();
   * const result = emptyQueue.dequeue();
   * if (result.isNone) {
   *   console.log("Queue is empty");
   * }
   * ```
   */
  dequeue(): Optional<T> {
    if (this.isEmpty) {
      return Optional.none;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const element = this.#buffer[this.#head]!;
    this.#buffer[this.#head] = undefined; // Clear reference for garbage collection
    this.#head = (this.#head + 1) % this.#capacity;
    this.#mut_size -= 1;

    return Optional.some(element);
  }

  /**
   * Adds an element to the back of the queue (FIFO).
   *
   * This operation adds the element to the end of the queue, where it will be the last
   * to be dequeued (first-in, first-out ordering). The operation is amortized O(1),
   * meaning it's O(1) for most operations with occasional O(n) when the buffer needs resizing.
   *
   * **Time Complexity:** O(1) amortized - O(n) only when buffer resize is needed
   * **Space Complexity:** O(1) - constant additional memory per element
   *
   * **Buffer Resizing:** When the internal buffer becomes full, it automatically doubles
   * in size and reorganizes elements to maintain the circular buffer structure.
   *
   * @param value The element to add to the back of the queue.
   *
   * @example
   * ```typescript
   * const taskQueue = createQueue<string>();
   *
   * // Add tasks in order of arrival
   * taskQueue.enqueue("Process order #1001");  // O(1)
   * taskQueue.enqueue("Send notification");    // O(1)
   * taskQueue.enqueue("Update inventory");     // O(1)
   *
   * console.log(taskQueue.size); // 3
   *
   * // Tasks will be processed in the order they were added
   * while (!taskQueue.isEmpty) {
   *   const task = taskQueue.dequeue().unwrap();
   *   console.log(`Executing: ${task}`);
   * }
   *
   * // High-volume enqueueing (demonstrates amortized O(1) performance)
   * const dataQueue = createQueue<number>();
   *
   * for (let i = 0; i < 1000000; i++) {
   *   dataQueue.enqueue(i); // Each operation is O(1) amortized
   * }
   *
   * console.log(dataQueue.size); // 1000000
   * ```
   */
  enqueue(value: T): void {
    // Resize if buffer is full
    if (this.#mut_size === this.#capacity) {
      this.#resize();
    }

    this.#buffer[this.#tail] = value;
    this.#tail = (this.#tail + 1) % this.#capacity;
    this.#mut_size += 1;
  }

  /**
   * @internal
   * Resizes the circular buffer when it becomes full.
   * Doubles the capacity and reorganizes elements to maintain queue order.
   */
  #resize(): void {
    const newCapacity = asUint32(this.#capacity * 2);
    const newBuffer = castMutable(
      Arr.create<T | undefined>(newCapacity, undefined),
    );

    // Copy elements in order from head to tail
    for (let i = 0; i < this.#mut_size; i++) {
      const sourceIndex = (this.#head + i) % this.#capacity;
      newBuffer[i] = this.#buffer[sourceIndex];
    }

    this.#buffer = newBuffer;
    this.#head = 0;
    this.#tail = this.#mut_size;
    this.#capacity = newCapacity;
  }
}

/**
 * Creates a new Queue instance with FIFO (First-In, First-Out) behavior using a high-performance circular buffer.
 *
 * This factory function creates an optimized queue implementation that maintains excellent performance
 * characteristics for both enqueue and dequeue operations. The underlying circular buffer automatically
 * resizes to accommodate growing workloads while providing predictable O(1) operations.
 *
 * **Implementation Features:**
 * - **O(1) enqueue operations** (amortized - occasionally O(n) when resizing)
 * - **O(1) dequeue operations** (always)
 * - **Automatic buffer resizing** - starts at 8 elements, doubles when full
 * - **Memory efficient** - garbage collects removed elements immediately
 * - **Circular buffer design** - eliminates need for array shifting operations
 *
 * **Performance Benefits:**
 * - No array copying during normal operations
 * - Minimal memory allocation overhead
 * - Predictable performance under high load
 * - Efficient memory usage with automatic cleanup
 *
 * @template T The type of elements stored in the queue.
 * @param initialValues Optional array of initial elements to populate the queue.
 *                      Elements will be dequeued in the same order they appear in the array.
 *                      If provided, the initial buffer capacity will be at least twice the array length.
 * @returns A new Queue instance optimized for high-performance FIFO operations.
 *
 * @example
 * ```typescript
 * import { createQueue } from './queue';
 *
 * // Example 1: Basic FIFO workflow
 * const requestQueue = createQueue<string>();
 *
 * // Add requests to the queue
 * requestQueue.enqueue("GET /api/users");     // O(1)
 * requestQueue.enqueue("POST /api/orders");   // O(1)
 * requestQueue.enqueue("DELETE /api/cache");  // O(1)
 *
 * // Process requests in order
 * while (!requestQueue.isEmpty) {
 *   const request = requestQueue.dequeue().unwrap(); // O(1)
 *   console.log(`Processing: ${request}`);
 * }
 * // Output:
 * // Processing: GET /api/users
 * // Processing: POST /api/orders
 * // Processing: DELETE /api/cache
 *
 * // Example 2: High-throughput event processing
 * type Event = { timestamp: number; type: string; data: any };
 * const eventQueue = createQueue<Event>();
 *
 * // Simulate high-volume event ingestion
 * for (let i = 0; i < 10000; i++) {
 *   eventQueue.enqueue({
 *     timestamp: Date.now(),
 *     type: `event-${i % 5}`,
 *     data: { value: i }
 *   }); // Each enqueue is O(1) amortized
 * }
 *
 * // Process events efficiently
 * let processedCount = 0;
 * while (!eventQueue.isEmpty) {
 *   const event = eventQueue.dequeue().unwrap(); // O(1)
 *   // Process event...
 *   processedCount++;
 * }
 * console.log(`Processed ${processedCount} events`); // 10000
 *
 * // Example 3: Queue with pre-populated data
 * const priorityTasks = createQueue<string>([
 *   "Initialize system",
 *   "Load configuration",
 *   "Start services",
 *   "Begin processing"
 * ]);
 *
 * console.log(priorityTasks.size); // Output: 4
 *
 * // Execute tasks in initialization order
 * while (!priorityTasks.isEmpty) {
 *   const task = priorityTasks.dequeue().unwrap();
 *   console.log(`Executing: ${task}`);
 * }
 *
 * // Example 4: Producer-Consumer pattern
 * const workQueue = createQueue<() => Promise<void>>();
 *
 * // Producer: Add work items
 * const addWork = (workFn: () => Promise<void>) => {
 *   workQueue.enqueue(workFn);
 * };
 *
 * // Consumer: Process work items
 * const processWork = async () => {
 *   while (!workQueue.isEmpty) {
 *     const workItem = workQueue.dequeue().unwrap();
 *     await workItem();
 *   }
 * };
 *
 * // Add some work
 * addWork(async () => console.log("Work item 1"));
 * addWork(async () => console.log("Work item 2"));
 *
 * // Process the work
 * await processWork();
 * ```
 */
export const createQueue = <T,>(initialValues?: readonly T[]): Queue<T> =>
  new QueueClass<T>(initialValues);
