import { source, withCurrentValueFrom } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(withCurrentValueFrom, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  name$     "Alice"           "Bob"               "Charlie"
    //  age$                25              30
    //  result$   (skip)          ["Bob",25]           ["Charlie",30]
    //
    //  Explanation:
    //  - withCurrentValueFrom samples the current value from another observable
    //  - Emits a tuple [sourceValue, sampledValue] each time the SOURCE emits
    //  - Does NOT emit when the sampled observable (age$) emits
    //  - Does not emit until both observables have emitted at least once
    //  - "Alice" is skipped because age$ hasn't emitted yet

    const name$ = source<string>();

    const age$ = source<number>();

    const result$ = name$.pipe(withCurrentValueFrom(age$));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: (readonly [string, number])[] = [];

    result$.subscribe(([name_, currentAge]) => {
      valueHistory.push([name_, currentAge]);
    });

    name$.next('Alice'); // nothing logged (age$ hasn't emitted)

    assert.deepStrictEqual(valueHistory, []);

    age$.next(25);

    name$.next('Bob'); // logs: Bob is 25 years old

    assert.deepStrictEqual(valueHistory, [['Bob', 25]]);

    age$.next(30);

    name$.next('Charlie'); // logs: Charlie is 30 years old

    assert.deepStrictEqual(valueHistory, [
      ['Bob', 25],
      ['Charlie', 30],
    ]);

    // embed-sample-code-ignore-below
  });
}
