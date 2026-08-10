import { source, unwrapOptional } from 'synstate';
import { Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test(unwrapOptional, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  opt$        Some(42)    None        Some(7)
    //  unwrapped$  42          undefined   7
    //
    //  Explanation:
    //  - unwrapOptional converts Some(value) to value, and None to undefined
    //  - Useful for extracting raw values from Optional streams

    const opt$ = source<Optional<number>>();

    const unwrapped$ = opt$.pipe(unwrapOptional());

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: (number | undefined)[] = [];

    unwrapped$.subscribe((v) => {
      valueHistory.push(v);
    });

    opt$.next(Optional.some(42));

    assert.deepStrictEqual(valueHistory, [42]);

    opt$.next(Optional.none);

    assert.deepStrictEqual(valueHistory, [42, undefined]);

    opt$.next(Optional.some(7));

    assert.deepStrictEqual(valueHistory, [42, undefined, 7]);

    // embed-sample-code-ignore-below
  });
}
