// `AbortSignal` is the mutable object the platform hands out; the source
// disables the same rule on `fromAbortablePromise`'s own factory parameter.
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { fromAbortablePromise, source, switchMap } from 'synstate';
import { Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test(fromAbortablePromise, async () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  query$      "a"            "b"
    //  request a   [in flight]    | (aborted)
    //  request b                  [in flight]  -> "result for b"
    //  results$                                  Ok("result for b")
    //
    //  Explanation:
    //  - fromAbortablePromise hands its factory an AbortSignal
    //  - switchMap completes the previous inner observable, which aborts it
    //  - The AbortError that follows is swallowed, so nothing is emitted for it

    const search = (query: string, signal: AbortSignal): Promise<string> =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          resolve(`result for ${query}`);
        }, 50);

        signal.addEventListener('abort', () => {
          clearTimeout(timer);

          reject(new DOMException('aborted', 'AbortError'));
        });
      });

    const query$ = source<string>();

    const results$ = query$.pipe(
      switchMap((query) =>
        fromAbortablePromise((signal) => search(query, signal)),
      ),
    );

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: Result<string, unknown>[] = [];

    results$.subscribe((result) => {
      valueHistory.push(result);
    });

    query$.next('a');

    query$.next('b');

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 150);
    });

    assert.deepStrictEqual(valueHistory, [Result.ok('result for b')]);

    // embed-sample-code-ignore-below
  });
}
