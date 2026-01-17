/* eslint-disable unicorn/consistent-function-scoping */
// Example: src/object/object.mts (shallowEq)
import { Obj } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const obj1 = { name: 'Alice', age: 30 };

    const obj2 = { name: 'Alice', age: 30 };

    const obj3 = { name: 'Alice', age: 31 };

    assert.isTrue(Obj.shallowEq(obj1, obj2));

    assert.isFalse(Obj.shallowEq(obj1, obj3));

    // Custom equality function
    const obj4 = { value: 1 };

    const obj5 = { value: 1.00001 };

    const closeEnough = (a: unknown, b: unknown): boolean => {
      if (typeof a === 'number' && typeof b === 'number') {
        return Math.abs(a - b) < 0.001;
      }

      return Object.is(a, b);
    };

    assert.isTrue(Obj.shallowEq(obj4, obj5, closeEnough));

    // embed-sample-code-ignore-below
  });
}
