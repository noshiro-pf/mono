import { Num } from 'ts-data-forge';

// Basic conversions
assert.strictEqual(Num.from('123'), 123);
assert.strictEqual(Number.isNaN(Num.from('abc')), true);

// Range checking
const inRange = Num.isInRange(0, 10);

assert.strictEqual(inRange(5), true);
assert.strictEqual(inRange(0), true); // (inclusive lower bound)
assert.strictEqual(inRange(10), false); // (exclusive upper bound)

// Clamping values
const clamp = Num.clamp(0, 100);

assert.strictEqual(clamp(150), 100);
assert.strictEqual(clamp(-10), 0);

// Rounding utilities
const round2 = Num.round(2);

assert.strictEqual(round2(3.14159), 3.14);
assert.strictEqual(Num.roundAt(3.14159, 3), 3.142);
assert.strictEqual(Num.roundToInt(3.7), 4);

// Type guards
const value = 5; // example value
if (Num.isNonZero(value)) {
  // value is guaranteed to be non-zero
  const result = Num.div(10, value); // Safe division
  assert.strictEqual(result, 2);
}
