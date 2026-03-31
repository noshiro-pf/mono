import { mapResultErr, source } from 'synstate';
import { Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test(mapResultErr, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  result$   Ok(1)    Err("bad")      Err("fail")
    //  mapped$   Ok(1)    Err("BAD")      Err("FAIL")
    //
    //  Explanation:
    //  - mapResultErr transforms the Err value of Result emissions
    //  - Ok values pass through unchanged

    const result$ = source<Result<number, string>>();

    const mapped$ = result$.pipe(mapResultErr((e) => e.toUpperCase()));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: Result<number, string>[] = [];

    mapped$.subscribe((v) => {
      valueHistory.push(v);
    });

    result$.next(Result.ok(1));

    assert.deepStrictEqual(valueHistory, [Result.ok(1)]);

    result$.next(Result.err('bad'));

    assert.deepStrictEqual(valueHistory, [Result.ok(1), Result.err('BAD')]);

    result$.next(Result.err('fail'));

    assert.deepStrictEqual(valueHistory, [
      Result.ok(1),
      Result.err('BAD'),
      Result.err('FAIL'),
    ]);

    // embed-sample-code-ignore-below
  });
}
