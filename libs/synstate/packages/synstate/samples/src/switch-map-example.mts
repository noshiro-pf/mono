/* eslint-disable unicorn/consistent-function-scoping */
import { source, switchMap } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(
    switchMap,
    async () => {
      // embed-sample-code-ignore-above

      //  Timeline:
      //
      //  input$      A                          B              C
      //  inner A     A1    A2    A3
      //  inner B                                B1    B2      (switched!)
      //  inner C                                              C1    C2    C3
      //  result$     A1    A2    A3              B1    B2      C1    C2    C3
      //
      //  Explanation:
      //  - switchMap creates an inner observable for each source value
      //  - When a new source value arrives, the previous inner is unsubscribed
      //  - A's inner completes normally (all 3 values emitted)
      //  - B's inner is interrupted by C (only 2 values emitted)
      //  - C's inner completes normally (all 3 values emitted)

      const input$ = source<string>();

      const result$ = input$.pipe(
        switchMap((letter) => {
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

      // Emit C - switches away from B (B3 cancelled), C's inner starts
      input$.next('C');

      await sleep(250);

      assert.deepStrictEqual(valueHistory, [
        'A1',
        'A2',
        'A3',
        'B1',
        'B2',
        'C1',
        'C2',
        'C3',
      ]);

      // embed-sample-code-ignore-below
    },
    10000,
  );
}
