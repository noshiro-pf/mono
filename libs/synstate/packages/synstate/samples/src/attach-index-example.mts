import { attachIndex, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(attachIndex, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  letter$    "A"      "B"      "C"
    //  indexed$   [0,"A"]  [1,"B"]  [2,"C"]
    //
    //  Explanation:
    //  - attachIndex attaches a sequential index to each emitted value
    //  - Produces [index, value] tuples
    //  - Index starts at 0 and increments with each emission

    const letter$ = source<string>();

    const indexed$ = letter$.pipe(attachIndex());

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: (readonly [number, string])[] = [];

    indexed$.subscribe(([i, letter]) => {
      valueHistory.push([i, letter]);
    });

    letter$.next('A');

    assert.deepStrictEqual(valueHistory, [[0, 'A']]);

    letter$.next('B');

    assert.deepStrictEqual(valueHistory, [
      [0, 'A'],
      [1, 'B'],
    ]);

    letter$.next('C');

    assert.deepStrictEqual(valueHistory, [
      [0, 'A'],
      [1, 'B'],
      [2, 'C'],
    ]);

    // embed-sample-code-ignore-below
  });
}
