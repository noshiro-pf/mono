import { getKey, source } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(getKey, () => {
    // embed-sample-code-ignore-above

    //  Timeline:
    //
    //  user$   { name: "Alice", age: 25 }   { name: "Bob", age: 30 }
    //  name$   "Alice"                       "Bob"
    //
    //  Explanation:
    //  - getKey extracts a property value from each emitted object
    //  - Equivalent to map(value => value[key])

    const user$ = source<Readonly<{ name: string; age: number }>>();

    const name$ = user$.pipe(getKey('name'));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: string[] = [];

    name$.subscribe((n) => {
      valueHistory.push(n);
    });

    user$.next({ name: 'Alice', age: 25 });

    assert.deepStrictEqual(valueHistory, ['Alice']);

    user$.next({ name: 'Bob', age: 30 });

    assert.deepStrictEqual(valueHistory, ['Alice', 'Bob']);

    // embed-sample-code-ignore-below
  });
}
