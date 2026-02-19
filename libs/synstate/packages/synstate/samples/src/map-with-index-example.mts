import { mapWithIndex, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(mapWithIndex, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  num$      "a"      "b"      "c"
    //  indexed$  "0: a"   "1: b"   "2: c"
    //
    //  Explanation:
    //  - mapWithIndex transforms each value along with its index
    //  - Index starts at 0 and increments with each emission

    const num$ = source<string>();

    const indexed$ = num$.pipe(mapWithIndex((x, i) => `${i}: ${x}`));

    const mut_history: string[] = [];

    indexed$.subscribe((s) => {
      mut_history.push(s);
    });

    num$.next('a'); // 0: a

    num$.next('b'); // 1: b

    num$.next('c'); // 2: c

    assert.deepStrictEqual(mut_history, ['0: a', '1: b', '2: c']);

    // embed-sample-code-ignore-below
  });
}
