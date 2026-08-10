import { createState, zip } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(zip, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  letters$  'A'       'B'       'C'
    //  numbers$  1         2         3
    //  zipped$   ['A',1]   ['B',2]   ['C',3]
    //
    //  Explanation:
    //  - zip pairs values by their index from multiple sources
    //  - Waits for all sources to emit at the same index
    //  - Completes when any source completes

    const [letters$, setLetter] = createState<string>('A');

    const [numbers$, setNumber] = createState<number>(1);

    const zipped$ = zip([letters$, numbers$]);

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: (readonly [string, number])[] = [];

    zipped$.subscribe(([letter, num]) => {
      valueHistory.push([letter, num]);
    });

    for (const letter of ['B', 'C']) {
      setLetter(letter);
    }

    for (const num of [2, 3]) {
      setNumber(num);
    }

    assert.deepStrictEqual(valueHistory, [
      ['A', 1],
      ['B', 2],
      ['C', 3],
    ]);

    // embed-sample-code-ignore-below
  });
}
