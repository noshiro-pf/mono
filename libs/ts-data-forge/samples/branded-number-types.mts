import {
  asFiniteNumber,
  asInt,
  asInt16,
  asNonZeroInt,
  asPositiveInt,
  asSafeInt,
  asUint,
  asUint32,
  Int16,
  NonZeroInt,
} from 'ts-data-forge';

// Basic branded types
const integer = asInt(42); // Int - any integer
const unsigned = asUint(42); // Uint - non-negative integer
const finite = asFiniteNumber(3.14); // FiniteNumber - finite floating-point
const safeInt = asSafeInt(42); // SafeInt - integer in safe range

assert.strictEqual(integer, 42);
assert.strictEqual(unsigned, 42);
assert.strictEqual(finite, 3.14);
assert.strictEqual(safeInt, 42);

// This line would cause a runtime error:
// const nonInteger = asInt(3.14);

// Range-constrained types (16-bit, 32-bit)
const int16 = asInt16(1000); // Int16: [-32768, 32767]
const uint32 = asUint32(3000000000); // Uint32: [0, 4294967295]
assert.strictEqual(int16, 1000);
assert.strictEqual(uint32, 3000000000);

// Non-zero and positive variants
const nonZeroInt = asNonZeroInt(5); // NonZeroInt - excludes zero
const positiveInt = asPositiveInt(10); // PositiveInt - excludes zero and negatives
assert.strictEqual(nonZeroInt, 5);
assert.strictEqual(positiveInt, 10);

// Type-safe arithmetic with automatic clamping
const sum = Int16.add(int16, asInt16(2000)); // Int16 (3000)
const clamped = Int16.clamp(100000); // Int16 (32767 - clamped to MAX_VALUE)
assert.strictEqual(sum, 3000);
assert.strictEqual(clamped, 32767);

// Safe division with non-zero types
const ratio = NonZeroInt.div(asNonZeroInt(10), nonZeroInt); // No division by zero risk
assert.strictEqual(ratio, 2);

// Random generation within type constraints
const randomInt16 = Int16.random(); // Int16 (random value in valid range)
assert.isNumber(randomInt16);
