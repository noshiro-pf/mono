import { fromArray, zip } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(zip, async () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  letters$  'a'       'b'       'c'
    //  numbers$  1         2         3
    //  zipped$   ['a',1]   ['b',2]   ['c',3]
    //
    //  Explanation:
    //  - zip pairs values by their index from multiple sources
    //  - Waits for all sources to emit at the same index
    //  - Completes when any source completes

    const letters$ = fromArray(['a', 'b', 'c']);

    const numbers$ = fromArray([1, 2, 3]);

    const zipped$ = zip([letters$, numbers$]);

    const mut_history: (readonly [string, number])[] = [];

    await new Promise<void>((resolve) => {
      zipped$.subscribe(
        ([letter, num]) => {
          mut_history.push([letter, num]);
        },
        () => {
          resolve();
        },
      );
    });

    assert.deepStrictEqual(mut_history, [
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);

    // embed-sample-code-ignore-below
  });
}
