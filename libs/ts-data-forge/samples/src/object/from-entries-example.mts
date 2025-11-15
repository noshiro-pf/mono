// Example: src/object/object.mts (fromEntries)
import { Obj } from 'ts-data-forge';

// embed-sample-code-ignore-above
// Fixed-length tuple - exact type inferred
const entries1 = [
  ['name', 'David'],
  ['age', 25],
  ['active', true],
] as const;

const obj1 = Obj.fromEntries(entries1);

assert.deepStrictEqual(obj1, {
  name: 'David',
  age: 25,
  active: true,
});

// Dynamic length array - Partial type applied
const dynamicEntries: (readonly ['x' | 'y', number])[] = [
  ['x', 10],
  ['y', 20],
];

const obj2 = Obj.fromEntries(dynamicEntries);

assert.deepStrictEqual(obj2, { x: 10, y: 20 });
