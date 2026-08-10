import { source, unwrapResultErr } from 'synstate';
import { Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test(unwrapResultErr, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  result$     Ok(1)      Err("fail")   Ok(2)
    //  unwrapped$  undefined  "fail"        undefined
    //
    //  Explanation:
    //  - unwrapResultErr converts Err(error) to error, and Ok to undefined
    //  - Useful for extracting error values from Result streams

    const result$ = source<Result<number, string>>();

    const unwrapped$ = result$.pipe(unwrapResultErr());

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: (string | undefined)[] = [];

    unwrapped$.subscribe((v) => {
      valueHistory.push(v);
    });

    result$.next(Result.ok(1));

    assert.deepStrictEqual(valueHistory, [undefined]);

    result$.next(Result.err('fail'));

    assert.deepStrictEqual(valueHistory, [undefined, 'fail']);

    result$.next(Result.ok(2));

    assert.deepStrictEqual(valueHistory, [undefined, 'fail', undefined]);

    // embed-sample-code-ignore-below
  });
}
