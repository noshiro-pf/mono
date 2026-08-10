// Example: src/object/object.mts (merge)
import { Obj } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const a = { a: 0, b: 0 } as const;

    const b = { b: 1, c: 0 } as const;

    const result = Obj.merge(a, b);

    assert.deepStrictEqual(result, { a: 0, b: 1, c: 0 });

    // embed-sample-code-ignore-below
  });
}
