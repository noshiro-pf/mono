import { map, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(map, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  num$      "A"      "B"      "C"
    //  indexed$  "0: A"   "1: B"   "2: C"
    //
    //  Explanation:
    //  - mapWithIndex transforms each value along with its index
    //  - Index starts at 0 and increments with each emission

    const num$ = source<string>();

    const indexed$ = num$.pipe(map((x, i) => `${i}: ${x}`));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: string[] = [];

    indexed$.subscribe((s) => {
      valueHistory.push(s);
    });

    num$.next('A'); // 0: A

    num$.next('B'); // 1: B

    num$.next('C'); // 2: C

    assert.deepStrictEqual(valueHistory, ['0: A', '1: B', '2: C']);

    // embed-sample-code-ignore-below
  });
}
