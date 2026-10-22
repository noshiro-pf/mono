import { empty } from 'synstate';

if (import.meta.vitest !== undefined) {
  test('empty', () => {
    // embed-sample-code-ignore-above

    const nothing$ = empty<number>();

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const valueHistory: number[] = [];

    nothing$.subscribe(
      (value) => {
        valueHistory.push(value);
      },
      () => {
        // onComplete — called immediately since empty() completes right away
      },
    );

    assert.deepStrictEqual(valueHistory, []);

    assert.strictEqual(nothing$.isCompleted, true);

    // embed-sample-code-ignore-below
  });
}
