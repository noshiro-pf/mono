import { mapOptional, source } from 'synstate';
import { Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test(mapOptional, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  value$    Some(2)    None       Some(5)
    //  doubled$  Some(4)    None       Some(10)
    //
    //  Explanation:
    //  - mapOptional transforms the inner value of Optional emissions
    //  - Some values are mapped; None values pass through unchanged

    const value$ = source<Optional<number>>();

    const doubled$ = value$.pipe(mapOptional((x) => x * 2));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: Optional<number>[] = [];

    doubled$.subscribe((v) => {
      valueHistory.push(v);
    });

    value$.next(Optional.some(2));

    assert.deepStrictEqual(valueHistory, [Optional.some(4)]);

    value$.next(Optional.none);

    assert.deepStrictEqual(valueHistory, [Optional.some(4), Optional.none]);

    value$.next(Optional.some(5));

    assert.deepStrictEqual(valueHistory, [
      Optional.some(4),
      Optional.none,
      Optional.some(10),
    ]);

    // embed-sample-code-ignore-below
  });
}
