// Example: src/object/object.mts (deepOmit)
import { Obj, pipe } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const data = { a: { b: { c: 1, d: 2 }, e: 3 }, f: 4 } as const;

    // Direct usage
    const result = Obj.deepOmit(data, ['a', 'b', 'c']);

    assert.deepStrictEqual(result, { a: { b: { d: 2 }, e: 3 }, f: 4 });

    // Curried usage with pipe
    const omitAB = Obj.deepOmit(['a', 'b']);

    const result2 = pipe(data).map(omitAB).value;

    assert.deepStrictEqual(result2, { a: { e: 3 }, f: 4 });

    // embed-sample-code-ignore-below
  });
}
