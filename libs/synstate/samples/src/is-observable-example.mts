import { createState, isObservable } from 'synstate';

if (import.meta.vitest !== undefined) {
  test('isObservable', () => {
    // embed-sample-code-ignore-above

    const [count$] = createState(0);

    assert.isTrue(isObservable(count$));

    // A `subscribe` method alone does not make an observable.
    assert.isFalse(isObservable({ subscribe: () => {} }));

    assert.isFalse(isObservable(0));

    // embed-sample-code-ignore-below
  });
}
