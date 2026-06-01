// Example: src/object/object.mts (deepPick)
import { Obj, pipe } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const data = { a: { b: { c: 1, d: 2 }, e: 3 }, f: 4 } as const;

    // Direct usage
    const result = Obj.deepPick(data, ['a', 'b', 'c']);

    assert.deepStrictEqual(result, { a: { b: { c: 1 } } });

    // Curried usage with pipe
    const pickAB = Obj.deepPick(['a', 'b']);

    const result2 = pipe(data).map(pickAB).value;

    assert.deepStrictEqual(result2, { a: { b: { c: 1, d: 2 } } });

    // embed-sample-code-ignore-below
  });
}
