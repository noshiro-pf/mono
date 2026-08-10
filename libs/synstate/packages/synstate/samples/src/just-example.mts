import { just } from 'synstate';

if (import.meta.vitest !== undefined) {
  test('just', () => {
    // embed-sample-code-ignore-above

    const greeting$ = just('hello');

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: string[] = [];

    greeting$.subscribe(
      (value) => {
        valueHistory.push(value);
      },
      () => {
        // onComplete — called immediately since just() completes right away
      },
    );

    assert.deepStrictEqual(valueHistory, ['hello']);

    assert.strictEqual(greeting$.isCompleted, true);

    // embed-sample-code-ignore-below
  });
}
