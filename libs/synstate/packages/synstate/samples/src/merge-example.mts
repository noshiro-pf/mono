import { merge, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(merge, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  clicks$   c1          c2                    c3
    //  keys$               k1          k2                    k3
    //  events$   c1        k1    c2    k2          c3        k3
    //
    //  Explanation:
    //  - merge combines multiple observables into one
    //  - Emits values from any source as they arrive
    //  - Order is preserved based on emission time

    const clicks$ = source<string>();

    const keys$ = source<string>();

    const events$ = merge([clicks$, keys$]);

    const mut_history: string[] = [];

    events$.subscribe((event_) => {
      mut_history.push(event_);
    });

    clicks$.next('c1');

    assert.deepStrictEqual(mut_history, ['c1']);

    keys$.next('k1');

    assert.deepStrictEqual(mut_history, ['c1', 'k1']);

    clicks$.next('c2');

    keys$.next('k2');

    assert.deepStrictEqual(mut_history, ['c1', 'k1', 'c2', 'k2']);

    // embed-sample-code-ignore-below
  });
}
