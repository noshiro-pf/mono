import { source, withCurrentValueFrom } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(withCurrentValueFrom, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  name$     "Alice"           "Bob"               "Charlie"
    //  age$                25              30      35              40
    //  result$             ["Alice",25]  ["Bob",30]  ["Bob",35]  ["Charlie",40]
    //
    //  Explanation:
    //  - withCurrentValueFrom samples the current value from another observable
    //  - Emits a tuple [sourceValue, sampledValue] each time the source emits
    //  - Does not emit until both observables have emitted at least once
    //  - Similar to combine, but only emits when the source (not the sampled) emits

    const name$ = source<string>();

    const age$ = source<number>();

    const result$ = name$.pipe(withCurrentValueFrom(age$));

    const mut_history: (readonly [string, number])[] = [];

    result$.subscribe(([name_, currentAge]) => {
      mut_history.push([name_, currentAge]);
    });

    name$.next('Alice'); // nothing logged (age$ hasn't emitted)

    assert.deepStrictEqual(mut_history, []);

    age$.next(25);

    name$.next('Bob'); // logs: Bob is 25 years old

    assert.deepStrictEqual(mut_history, [['Bob', 25]]);

    age$.next(30);

    name$.next('Charlie'); // logs: Charlie is 30 years old

    assert.deepStrictEqual(mut_history, [
      ['Bob', 25],
      ['Charlie', 30],
    ]);

    // embed-sample-code-ignore-below
  });
}
