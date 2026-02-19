import { combine, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(combine, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  name$     "Alice"                 "Bob"
    //  age$                25                        30
    //  user$               ["Alice",25]  ["Bob",25]  ["Bob",30]
    //
    //  Explanation:
    //  - combine waits for all sources to emit at least once
    //  - Then emits the latest value from all sources whenever any source emits
    //  - Always emits an array with the latest values from each source

    const name$ = source<string>();

    const age$ = source<number>();

    const user$ = combine([name$, age$]);

    const mut_history: (readonly [string, number])[] = [];

    user$.subscribe(([name_, age]) => {
      mut_history.push([name_, age]);
    });

    name$.next('Alice'); // nothing logged (age$ hasn't emitted yet)

    assert.deepStrictEqual(mut_history, []);

    age$.next(25); // logs: { name: 'Alice', age: 25 }

    assert.deepStrictEqual(mut_history, [['Alice', 25]]);

    name$.next('Bob'); // logs: { name: 'Bob', age: 25 }

    assert.deepStrictEqual(mut_history, [
      ['Alice', 25],
      ['Bob', 25],
    ]);

    age$.next(30); // logs: { name: 'Bob', age: 30 }

    assert.deepStrictEqual(mut_history, [
      ['Alice', 25],
      ['Bob', 25],
      ['Bob', 30],
    ]);

    // embed-sample-code-ignore-below
  });
}
