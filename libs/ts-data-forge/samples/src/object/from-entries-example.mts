// Example: src/object/object-impl.mts (fromEntries)
import { Obj } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
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

    // Dynamic length array - each key optional
    const dynamicEntries: readonly (readonly ['x' | 'y', number])[] = [
      ['x', 10],
      ['y', 20],
    ] as const;

    const obj2 = Obj.fromEntries(dynamicEntries);

    assert.deepStrictEqual(obj2, { x: 10, y: 20 });

    // embed-sample-code-ignore-below
  });
}
