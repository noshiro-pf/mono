import { Num } from 'ts-data-forge';

// Basic conversions
assert(Num.from('123') === 123);
assert(Number.isNaN(Num.from('abc')));

// Range checking
const inRange = Num.isInRange(0, 10);

assert(inRange(5));
assert(inRange(0)); // (inclusive lower bound)
assert(!inRange(10)); // (exclusive upper bound)

// Clamping values
const clamp = Num.clamp(0, 100);

assert(clamp(150) === 100);
assert(clamp(-10) === 0);

// Rounding utilities
const round2 = Num.round(2);

assert(round2(3.14159) === 3.14);
assert(Num.roundAt(3.14159, 3) === 3.142);
assert(Num.roundToInt(3.7) === 4);

// Type guards
const value = 5; // example value
if (Num.isNonZero(value)) {
  // value is guaranteed to be non-zero
  const result = Num.div(10, value); // Safe division
  assert(result === 2);
}
