import * as assert from 'node:assert/strict';
import { number, record, string } from 'ts-fortress';

const User = record({ name: string(''), age: number(0) });

// A valid value passes through unchanged.
assert.deepStrictEqual(User.fill({ name: 'noshiro', age: 3 }), {
  name: 'noshiro',
  age: 3,
});

// A missing field is filled from the default rather than throwing.
assert.deepStrictEqual(User.fill({ name: 'noshiro' }), {
  name: 'noshiro',
  age: 0,
});

assert.equal(User.is({ name: 'noshiro', age: 3 }), true);
assert.equal(User.is({ name: 'noshiro', age: 'three' }), false);

console.info('ts-fortress ok');
