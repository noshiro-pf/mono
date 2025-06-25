import { Num } from 'ts-data-forge';

// Basic conversions
if (import.meta.vitest !== undefined) {
  expect(Num.from('123')).toBe(123);
  expect(Num.from('abc')).toBeNaN();
}

// Range checking
const inRange = Num.isInRange(0, 10);

if (import.meta.vitest !== undefined) {
  expect(inRange(5)).toBe(true);
  expect(inRange(0)).toBe(true); // (inclusive lower bound)
  expect(inRange(10)).toBe(false); // (exclusive upper bound)
}

// Clamping values
const clamp = Num.clamp(0, 100);

if (import.meta.vitest !== undefined) {
  expect(clamp(150)).toBe(100);
  expect(clamp(-10)).toBe(0);
}

// Rounding utilities
const round2 = Num.round(2);

if (import.meta.vitest !== undefined) {
  expect(round2(3.14159)).toBe(3.14);
  expect(Num.roundAt(3.14159, 3)).toBe(3.142);
  expect(Num.roundToInt(3.7)).toBe(4);
}

// Type guards
const value = 5; // example value
if (Num.isNonZero(value)) {
  // value is guaranteed to be non-zero
  const result = Num.div(10, value); // Safe division
  if (import.meta.vitest !== undefined) {
    expect(result).toBe(2);
  }
}
