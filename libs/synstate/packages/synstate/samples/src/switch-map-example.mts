import { source, switchMap } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(
    switchMap,
    async () => {
      // embed-sample-code-ignore-above

      //  Timeline:
      //
      //  searchQuery$  "a"       "ab"      "abc"
      //  requests      fetch1    fetch2    fetch3
      //  results$                cancel    cancel    result3
      //                          fetch1    fetch2
      //
      //  Explanation:
      //  - switchMap cancels previous inner observables when a new value arrives
      //  - Only the result from the latest search query is emitted
      //  - Previous ongoing requests are cancelled
      //  - Ideal for search-as-you-type scenarios

      const searchQuery$ = source<string>();

      const results$ = searchQuery$.pipe(
        switchMap((query) => {
          const result$ = source<string[]>();

          setTimeout(() => {
            result$.next([query]);

            result$.complete();
          }, 10);

          return result$;
        }),
      );

      const mut_history: string[][] = [];

      results$.subscribe((value) => {
        mut_history.push(value);
      });

      searchQuery$.next('a');

      searchQuery$.next('ab');

      searchQuery$.next('abc');

      await new Promise((resolve) => {
        setTimeout(resolve, 200);
      });

      assert.deepStrictEqual(mut_history, [['abc']]);

      // embed-sample-code-ignore-below
    },
    10000,
  );
}
