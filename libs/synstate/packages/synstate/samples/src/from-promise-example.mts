/* eslint-disable @typescript-eslint/require-await */
import { fromPromise } from 'synstate';
import { Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test(fromPromise, async () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  promise     [pending...]  -> resolved/rejected
    //  data$                     Ok(value) or Err(error)
    //
    //  Explanation:
    //  - fromPromise converts a Promise into an observable
    //  - Emits a Result type: Ok(value) on success, Err(error) on failure
    //  - Completes after emitting the result
    //  - Useful for integrating async operations into reactive flows

    const fetchData = async (): Promise<{ value: number }> => ({ value: 42 });

    const data$ = fromPromise(fetchData());

    const mut_history: { value: number }[] = [];

    await new Promise<void>((resolve) => {
      data$.subscribe(
        (result) => {
          if (Result.isOk(result)) {
            mut_history.push(result.value);
          }
        },
        () => {
          resolve();
        },
      );
    });

    assert.deepStrictEqual(mut_history, [{ value: 42 }]);

    // embed-sample-code-ignore-below
  });
}
