[**Documentation**](../README.md)

---

[Documentation](../README.md) / iterator/range

# iterator/range

## Variables

### range

> `const` **range**: `RangeFnOverload`

Defined in: [src/iterator/range.mts:94](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/iterator/range.mts#L94)

Generates a sequence of numbers within a specified range using a generator function.

This function creates a generator that yields numbers from `start` (inclusive) to `end` (exclusive)
with the specified `step` increment/decrement. The function implements the JavaScript iterator protocol,
making it compatible with for-of loops, spread operator, Array.from(), and other iterator consumers.

The function has two overloaded signatures:

1. For non-negative ranges: accepts SafeUint parameters and optional positive step
2. For general ranges: accepts SafeInt parameters and optional non-zero step

**Generator Behavior:**

- Yields values lazily (computed on-demand)
- Returns `void` when iteration completes
- Does not accept sent values (next parameter is ignored)
- Automatically handles direction based on step sign and start/end relationship

**Step Parameter Behavior:**

- Positive step: iterates from start toward end (start < end expected)
- Negative step: iterates from start toward end (start > end expected)
- Zero step: not allowed (NonZeroSafeInt constraint)
- Default step: 1 (positive direction)

**Edge Cases:**

- When start equals end: yields no values (empty sequence)
- When step direction conflicts with start/end relationship: yields no values
- All parameters must be safe integers (within JavaScript's safe integer range)

#### Template

The specific SafeInt or SafeUint type being generated

#### Param

The starting number of the sequence (inclusive). Must be a safe integer.

#### Param

The end number of the sequence (exclusive). Must be a safe integer.

#### Param

The increment or decrement value. Defaults to 1. Must be non-zero safe integer.

#### Returns

A Generator object that yields safe integers in the specified range.

#### Example

```typescript
// Basic ascending range
for (const n of range(0, 5)) {
    console.log(n); // Outputs: 0, 1, 2, 3, 4
}

// Range with custom step
for (const n of range(0, 10, 2)) {
    console.log(n); // Outputs: 0, 2, 4, 6, 8
}

// Descending range with negative step
for (const n of range(10, 0, -1)) {
    console.log(n); // Outputs: 10, 9, 8, 7, 6, 5, 4, 3, 2, 1
}

// Negative numbers with negative step
for (const n of range(0, -10, -1)) {
    console.log(n); // Outputs: 0, -1, -2, -3, -4, -5, -6, -7, -8, -9
}

// Convert generator to array
const numbers = Array.from(range(1, 4)); // [1, 2, 3]
const evens = [...range(0, 11, 2)]; // [0, 2, 4, 6, 8, 10]

// Empty ranges
Array.from(range(5, 5)); // [] (start equals end)
Array.from(range(5, 3)); // [] (positive step, start > end)
Array.from(range(3, 5, -1)); // [] (negative step, start < end)

// Using with iterator protocol manually
const gen = range(1, 4);
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }

// Practical usage patterns
// Create index sequences
const indices = Array.from(range(0, items.length));

// Generate test data
const testIds = [...range(1, 101)]; // [1, 2, ..., 100]

// Iterate with step intervals
for (const minute of range(0, 60, 5)) {
    scheduleTask(minute); // Every 5 minutes
}

// Countdown sequences
for (const count of range(10, 0, -1)) {
    console.log(`T-minus ${count}`);
}
```
