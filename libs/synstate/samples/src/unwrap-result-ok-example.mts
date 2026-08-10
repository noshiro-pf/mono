import { source, unwrapResultOk } from 'synstate';
import { Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test(unwrapResultOk, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  result$     Ok(42)    Err("e")    Ok(7)
    //  unwrapped$  42        undefined   7
    //
    //  Explanation:
    //  - unwrapResultOk converts Ok(value) to value, and Err to undefined
    //  - Useful for extracting success values from Result streams

    const result$ = source<Result<number, string>>();

    const unwrapped$ = result$.pipe(unwrapResultOk());

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: (number | undefined)[] = [];

    unwrapped$.subscribe((v) => {
      valueHistory.push(v);
    });

    result$.next(Result.ok(42));

    assert.deepStrictEqual(valueHistory, [42]);

    result$.next(Result.err('e'));

    assert.deepStrictEqual(valueHistory, [42, undefined]);

    result$.next(Result.ok(7));

    assert.deepStrictEqual(valueHistory, [42, undefined, 7]);

    // embed-sample-code-ignore-below
  });
}
