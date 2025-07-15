[**Documentation**](../README.md)

---

[Documentation](../README.md) / collections/stack

# collections/stack

## Type Aliases

### Stack\<T\>

> **Stack**\<`T`\> = `Readonly`\<\{ `isEmpty`: `boolean`; `pop`: () => [`Optional`](../functional/optional/README.md#optional)\<`T`\>; `push`: (`value`) => `void`; `size`: `SizeType.Arr`; \}\>

Defined in: [src/collections/stack.mts:65](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/stack.mts#L65)

Interface for a high-performance stack with LIFO (Last-In, First-Out) behavior.

This interface defines a mutable stack data structure where elements are added to and removed
from the top, following the Last-In, First-Out principle. The implementation uses a dynamic
array for optimal performance, providing O(1) operations for both push and pop operations.

**LIFO Behavior:**

- **push**: Adds elements to the top of the stack
- **pop**: Removes and returns elements from the top of the stack
- The last element added is the first element to be removed

**Performance Characteristics:**

- push: O(1) amortized (O(n) when buffer needs resizing)
- pop: O(1) always
- size/isEmpty: O(1) always
- Memory efficient with automatic garbage collection of removed elements

**Use Cases:**

- Function call management and recursion
- Undo/redo functionality
- Expression evaluation and parsing
- Depth-first search algorithms
- Backtracking algorithms
- Browser history management

#### Type Parameters

##### T

`T`

The type of elements stored in the stack.

#### Example

```typescript
import { createStack, Stack } from './stack';

// Example 1: Basic LIFO operations
const operationStack: Stack<string> = createStack<string>();

operationStack.push('operation1'); // Add to top
operationStack.push('operation2'); // Add to top
operationStack.push('operation3'); // Add to top

console.log(operationStack.size); // Output: 3

// Process operations in LIFO order
console.log(operationStack.pop().unwrap()); // "operation3" (last in, first out)
console.log(operationStack.pop().unwrap()); // "operation2"
console.log(operationStack.size); // Output: 1

// Example 2: Undo functionality
type Action = { type: string; data: any; timestamp: number };
const undoStack: Stack<Action> = createStack<Action>();

undoStack.push({ type: 'delete', data: { id: 123 }, timestamp: Date.now() });
undoStack.push({
    type: 'edit',
    data: { field: 'name', oldValue: 'old' },
    timestamp: Date.now(),
});

// Undo last action
if (!undoStack.isEmpty) {
    const lastAction = undoStack.pop().unwrap();
    console.log(`Undoing: ${lastAction.type}`);
}
```

## Functions

### createStack()

> **createStack**\<`T`\>(`initialValues?`): [`Stack`](#stack)\<`T`\>

Defined in: [src/collections/stack.mts:423](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/collections/stack.mts#L423)

Creates a new Stack instance with LIFO (Last-In, First-Out) behavior using a high-performance dynamic array.

This factory function creates an optimized stack implementation that maintains excellent performance
characteristics for both push and pop operations. The underlying dynamic array automatically
resizes to accommodate growing workloads while providing predictable O(1) operations.

**Implementation Features:**

- **O(1) push operations** (amortized - occasionally O(n) when resizing)
- **O(1) pop operations** (always)
- **Automatic buffer resizing** - starts at 8 elements, doubles when full
- **Memory efficient** - garbage collects removed elements immediately
- **Dynamic array design** - eliminates need for complex memory management

**Performance Benefits:**

- No array shifting required for stack operations
- Minimal memory allocation overhead
- Predictable performance under high load
- Efficient memory usage with automatic cleanup

#### Type Parameters

##### T

`T`

The type of elements stored in the stack.

#### Parameters

##### initialValues?

readonly `T`[]

Optional array of initial elements to populate the stack.
Elements will be popped in reverse order of how they appear in the array
(last array element will be popped first).
If provided, the initial buffer capacity will be at least twice the array length.

#### Returns

[`Stack`](#stack)\<`T`\>

A new Stack instance optimized for high-performance LIFO operations.

#### Example

```typescript
import { createStack } from './stack';

// Example 1: Function call simulation
type FunctionCall = { name: string; args: any[]; context: any };
const callStack = createStack<FunctionCall>();

// Simulate function calls (push onto stack)
callStack.push({ name: 'main', args: [], context: {} }); // O(1)
callStack.push({ name: 'processData', args: [data], context: {} }); // O(1)
callStack.push({ name: 'validateInput', args: [input], context: {} }); // O(1)

// Simulate function returns (pop from stack)
while (!callStack.isEmpty) {
    const call = callStack.pop().unwrap(); // O(1)
    console.log(`Returning from: ${call.name}`);
}
// Output:
// Returning from: validateInput
// Returning from: processData
// Returning from: main

// Example 2: Expression evaluation with operator precedence
const operatorStack = createStack<string>();
const operandStack = createStack<number>();

// Simulate parsing "3 + 4 * 2"
operandStack.push(3);
operatorStack.push('+');
operandStack.push(4);
operatorStack.push('*'); // Higher precedence
operandStack.push(2);

// Process higher precedence first (LIFO)
const op = operatorStack.pop().unwrap(); // "*"
const b = operandStack.pop().unwrap(); // 2
const a = operandStack.pop().unwrap(); // 4
operandStack.push(a * b); // Push result: 8

// Example 3: Undo/Redo functionality
type EditAction = {
    type: 'insert' | 'delete' | 'modify';
    position: number;
    oldValue: string;
    newValue: string;
};

const undoStack = createStack<EditAction>();
const redoStack = createStack<EditAction>();

// Perform edits (push to undo stack)
const edit1: EditAction = {
    type: 'insert',
    position: 0,
    oldValue: '',
    newValue: 'Hello',
};
const edit2: EditAction = {
    type: 'insert',
    position: 5,
    oldValue: '',
    newValue: ' World',
};

undoStack.push(edit1);
undoStack.push(edit2);

// Undo last edit
if (!undoStack.isEmpty) {
    const lastEdit = undoStack.pop().unwrap();
    redoStack.push(lastEdit);
    console.log(`Undid: ${lastEdit.type} at position ${lastEdit.position}`);
}

// Example 4: High-throughput data processing
const processingStack = createStack<number>();

// Add large amount of data (demonstrates amortized O(1) performance)
for (const i of range(100000)) {
    processingStack.push(i); // Each push is O(1) amortized
}

// Process data in LIFO order
let processedCount = 0;
while (!processingStack.isEmpty) {
    const value = processingStack.pop().unwrap(); // O(1)
    // Process value...
    processedCount++;
}
console.log(`Processed ${processedCount} items`); // 100000

// Example 5: Stack with pre-populated data
const historyStack = createStack<string>([
    'page1.html',
    'page2.html',
    'page3.html',
    'page4.html',
]);

console.log(historyStack.size); // Output: 4

// Navigate back through history (LIFO order)
while (!historyStack.isEmpty) {
    const page = historyStack.pop().unwrap();
    console.log(`Going back to: ${page}`);
}
// Output:
// Going back to: page4.html (last added, first removed)
// Going back to: page3.html
// Going back to: page2.html
// Going back to: page1.html
```
