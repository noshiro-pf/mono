import { createBooleanState } from 'synstate-preact-signals';

if (import.meta.vitest !== undefined) {
  test('createBooleanState', () => {
    // embed-sample-code-ignore-above

    // eslint-disable-next-line @typescript-eslint/no-shadow
    const [isOpenSignal, { setTrue: open, setFalse: close, toggle }] =
      createBooleanState(false);

    assert.strictEqual(isOpenSignal.value, false);

    open();

    assert.strictEqual(isOpenSignal.value, true);

    close();

    assert.strictEqual(isOpenSignal.value, false);

    toggle();

    assert.strictEqual(isOpenSignal.value, true);

    // embed-sample-code-ignore-below
  });
}
