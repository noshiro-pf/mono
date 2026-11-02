import * as assert from 'node:assert/strict';
import { Arr, Num, Result } from 'ts-data-forge';
import * as ArrModule from 'ts-data-forge/array';
import * as NumModule from 'ts-data-forge/number';

// Arrays keep their length in the type and stay immutable at runtime.
assert.deepStrictEqual(Arr.zip([1, 2, 3], ['a', 'b', 'c']), [
  [1, 'a'],
  [2, 'b'],
  [3, 'c'],
]);

// The `array` subpath is the same functions as `Arr`, as a module of its own.
assert.deepStrictEqual(Object.keys(ArrModule).sort(), Object.keys(Arr).sort());
assert.equal(ArrModule.zip, Arr.zip);

// So is the `number` subpath with `Num`.
assert.deepStrictEqual(Object.keys(NumModule).sort(), Object.keys(Num).sort());
assert.equal(NumModule.clamp, Num.clamp);

// Division is total: the denominator has to be proved non-zero first.
assert.equal(Num.isNonZero(4) ? Num.div(10, 4) : undefined, 2.5);

// Result carries failure in the value, not in a throw.
const parsed = Result.map(Result.ok(2), (n) => n * 21);
assert.equal(Result.isOk(parsed) && parsed.value, 42);

console.info('ts-data-forge ok');
