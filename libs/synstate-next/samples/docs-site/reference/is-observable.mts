import { createState, isObservable } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('is-observable', () => {
    // embed-sample-code-ignore-above
    const [count] = createState(0);

    assert.isTrue(isObservable(count));

    assert.isFalse(isObservable({ value: 0 }));

    // embed-sample-code-ignore-below
  });
}
