/* eslint-disable unicorn/consistent-function-scoping */
import { mergeMap, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(
    mergeMap,
    async () => {
      // embed-sample-code-ignore-above

      //  Timeline:
      //
      //  input$      A                          B              C
      //  inner A     A1    A2    A3
      //  inner B                                B1    B2             B3
      //  inner C                                              C1         C2    C3
      //  result$     A1    A2    A3              B1    B2      C1    B3   C2    C3
      //
      //  Explanation:
      //  - mergeMap creates an inner observable for each source value
      //  - Unlike switchMap, previous inner observables are NOT cancelled
      //  - B's inner continues even after C arrives (B3 is still emitted)
      //  - All inner observables run concurrently and their results are merged

      const input$ = source<string>();

      const result$ = input$.pipe(
        mergeMap((letter) => {
          const inner$ = source<string>();

          setTimeout(() => {
            inner$.next(`${letter}1`);
          }, 10);

          setTimeout(() => {
            inner$.next(`${letter}2`);
          }, 110);

          setTimeout(() => {
            inner$.next(`${letter}3`);
          }, 210);

          return inner$;
        }),
      );

      // transformer-ignore-next-line convert-to-readonly, append-as-const
      const valueHistory: string[] = [];

      result$.subscribe((value) => {
        valueHistory.push(value);
      });

      const sleep = (ms: number): Promise<void> =>
        new Promise((resolve) => {
          setTimeout(resolve, ms);
        });

      // Emit A - inner emits A1, A2, A3 at 10ms, 110ms, 210ms
      input$.next('A');

      await sleep(250);

      assert.deepStrictEqual(valueHistory, ['A1', 'A2', 'A3']);

      // Emit B - inner starts emitting B1, B2 at 10ms, 110ms
      input$.next('B');

      await sleep(150);

      assert.deepStrictEqual(valueHistory, ['A1', 'A2', 'A3', 'B1', 'B2']);

      // Emit C while B's inner is still running (B3 at 210ms not yet fired)
      // Unlike switchMap, B's inner is NOT cancelled
      input$.next('C');

      await sleep(250);

      // B3 appears between C1 and C2, showing the merge behavior
      assert.deepStrictEqual(valueHistory, [
        'A1',
        'A2',
        'A3',
        'B1',
        'B2',
        'C1',
        'B3',
        'C2',
        'C3',
      ]);

      // embed-sample-code-ignore-below
    },
    10000,
  );
}
