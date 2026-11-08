import { createValueEmitter, withInitialValue } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('with-initial-value', () => {
    // embed-sample-code-ignore-above
    const [message, receive] = createValueEmitter<string>();

    const latest = message.pipe(withInitialValue('(none yet)'));

    // An `InitializedObservable`: `.value` is there from the start.
    assert.strictEqual(latest.value, '(none yet)');

    receive('hello');

    assert.strictEqual(latest.value, 'hello');

    // embed-sample-code-ignore-below
  });
}
