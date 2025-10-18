// Example: src/others/tuple.mts (tp)
import { expectType, tp } from 'ts-data-forge';

// embed-sample-code-ignore-above
// Create a tuple with literal types preserved
const coordinates = tp(10, 20, 30);
expectType<typeof coordinates, readonly [10, 20, 30]>('=');
expectType<typeof coordinates, readonly number[]>('!=');
assert.deepStrictEqual(coordinates, [10, 20, 30]);

// The following two are equivalent
const a = tp(1, 2);
const b = [1, 2] as const;
expectType<typeof a, typeof b>('=');
assert.deepStrictEqual(a, b);

// Without tp, type would be number[]
const point = tp('x', 42, true);
expectType<typeof point, readonly ['x', 42, true]>('=');
assert.deepStrictEqual(point, ['x', 42, true]);

// Useful for creating const tuples
const rgb = tp(255, 128, 0);
expectType<typeof rgb, readonly [255, 128, 0]>('=');

assert(rgb[0] === 255);
assert(rgb[1] === 128);
assert(rgb[2] === 0);
