// Example: src/object/object.mts (shallowEq)
import { Obj } from 'ts-data-forge';

// embed-sample-code-ignore-above
const obj1 = { name: 'Alice', age: 30 };
const obj2 = { name: 'Alice', age: 30 };
const obj3 = { name: 'Alice', age: 31 };

assert.ok(Obj.shallowEq(obj1, obj2));
assert.notOk(Obj.shallowEq(obj1, obj3));

// Custom equality function
const obj4 = { value: 1 };
const obj5 = { value: 1.00001 };

const closeEnough = (a: unknown, b: unknown): boolean => {
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < 0.001;
  }
  return Object.is(a, b);
};

assert.ok(Obj.shallowEq(obj4, obj5, closeEnough));
