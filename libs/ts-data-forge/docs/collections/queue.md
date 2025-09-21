[**ts-data-forge**](../README.md)

---

[ts-data-forge](../README.md) / collections/queue

# collections/queue

## Type Aliases

### Queue

> **Queue**\<`T`\> = `Readonly`\<\{ `dequeue`: () => [`Optional`](../functional/optional/README.md#optional)\<`T`\>; `enqueue`: (`value`) => `void`; `isEmpty`: `boolean`; `size`: [`Arr`](../globals/namespaces/SizeType.md#arr); \}\>

Defined in: [src/collections/queue.mts:66](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/queue.mts#L66)

Interface for a high-performance queue with FIFO (First-In, First-Out) behavior.

This interface defines a mutable queue data structure where elements are added to the back
and removed from the front, maintaining the order in which they were added. The implementation
uses a circular buffer for optimal performance, providing O(1) operations for both enqueue
and dequeue operations.

**FIFO Behavior:**

- **enqueue**: Adds elements to the back of the queue
- **dequeue**: Removes and returns elements from the front of the queue
- Elements are processed in the exact order they were added

**Performance Characteristics:**

- enqueue: O(1) amortized (O(n) when buffer needs resizing)
- dequeue: O(1) always
- size/isEmpty: O(1) always
- Memory efficient with automatic garbage collection of removed elements

**Use Cases:**

- Task scheduling and job queues
- Breadth-first search algorithms
- Event processing systems
- Producer-consumer patterns
- Buffer management for streaming data

#### Type Parameters

##### T

`T`

The type of elements stored in the queue.

#### Example

```typescript
import { createQueue, Queue } from './queue';

// Example 1: Basic FIFO operations
const messageQueue: Queue<string> = createQueue<string>();

messageQueue.enqueue('first message'); // Add to back
messageQueue.enqueue('second message'); // Add to back
messageQueue.enqueue('third message'); // Add to back

console.log(messageQueue.size); // Output: 3

// Process messages in FIFO order
console.log(messageQueue.dequeue().unwrap()); // "first message" (first in, first out)
console.log(messageQueue.dequeue().unwrap()); // "second message"
console.log(messageQueue.size); // Output: 1

// Example 2: Task processing system
type Task = { id: number; priority: string; action: () => void };
const taskQueue: Queue<Task> = createQueue<Task>();

taskQueue.enqueue({
    id: 1,
    priority: 'high',
    action: () => console.log('Task 1'),
});
taskQueue.enqueue({
    id: 2,
    priority: 'low',
    action: () => console.log('Task 2'),
});

// Process tasks in order
while (!taskQueue.isEmpty) {
    const task = taskQueue.dequeue().unwrap();
    console.log(`Processing task ${task.id} with ${task.priority} priority`);
    task.action();
}
```

## Functions

### createQueue()

> **createQueue**\<`T`\>(`initialValues?`): [`Queue`](#queue)\<`T`\>

Defined in: [src/collections/queue.mts:391](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/queue.mts#L391)

Creates a new Queue instance with FIFO (First-In, First-Out) behavior using a high-performance circular buffer.

This factory function creates an optimized queue implementation that maintains excellent performance
characteristics for both enqueue and dequeue operations. The underlying circular buffer automatically
resizes to accommodate growing workloads while providing predictable O(1) operations.

**Implementation Features:**

- **O(1) enqueue operations** (amortized - occasionally O(n) when resizing)
- **O(1) dequeue operations** (always)
- **Automatic buffer resizing** - starts at 8 elements, doubles when full
- **Memory efficient** - garbage collects removed elements immediately
- **Circular buffer design** - eliminates need for array shifting operations

**Performance Benefits:**

- No array copying during normal operations
- Minimal memory allocation overhead
- Predictable performance under high load
- Efficient memory usage with automatic cleanup

#### Type Parameters

##### T

`T`

The type of elements stored in the queue.

#### Parameters

##### initialValues?

readonly `T`[]

Optional array of initial elements to populate the queue.
Elements will be dequeued in the same order they appear in the array.
If provided, the initial buffer capacity will be at least twice the array length.

#### Returns

[`Queue`](#queue)\<`T`\>

A new Queue instance optimized for high-performance FIFO operations.

#### Example

```typescript
import { createQueue } from './queue';

// Example 1: Basic FIFO workflow
const requestQueue = createQueue<string>();

// Add requests to the queue
requestQueue.enqueue('GET /api/users'); // O(1)
requestQueue.enqueue('POST /api/orders'); // O(1)
requestQueue.enqueue('DELETE /api/cache'); // O(1)

// Process requests in order
while (!requestQueue.isEmpty) {
    const request = requestQueue.dequeue().unwrap(); // O(1)
    console.log(`Processing: ${request}`);
}
// Output:
// Processing: GET /api/users
// Processing: POST /api/orders
// Processing: DELETE /api/cache

// Example 2: High-throughput event processing
type Event = { timestamp: number; type: string; data: any };
const eventQueue = createQueue<Event>();

// Simulate high-volume event ingestion
for (const i of range(10000)) {
    eventQueue.enqueue({
        timestamp: Date.now(),
        type: `event-${i % 5}`,
        data: { value: i },
    }); // Each enqueue is O(1) amortized
}

// Process events efficiently
let processedCount = 0;
while (!eventQueue.isEmpty) {
    const event = eventQueue.dequeue().unwrap(); // O(1)
    // Process event...
    processedCount++;
}
console.log(`Processed ${processedCount} events`); // 10000

// Example 3: Queue with pre-populated data
const priorityTasks = createQueue<string>([
    'Initialize system',
    'Load configuration',
    'Start services',
    'Begin processing',
]);

console.log(priorityTasks.size); // Output: 4

// Execute tasks in initialization order
while (!priorityTasks.isEmpty) {
    const task = priorityTasks.dequeue().unwrap();
    console.log(`Executing: ${task}`);
}

// Example 4: Producer-Consumer pattern
const workQueue = createQueue<() => Promise<void>>();

// Producer: Add work items
const addWork = (workFn: () => Promise<void>) => {
    workQueue.enqueue(workFn);
};

// Consumer: Process work items
const processWork = async () => {
    while (!workQueue.isEmpty) {
        const workItem = workQueue.dequeue().unwrap();
        await workItem();
    }
};

// Add some work
addWork(async () => console.log('Work item 1'));
addWork(async () => console.log('Work item 2'));

// Process the work
await processWork();
```
