import { createState } from 'synstate-preact-signals';

if (import.meta.vitest !== undefined) {
  test('createState', () => {
    // embed-sample-code-ignore-above

    const [
      countSignal,
      setCount,
      { updateState, resetState, getSnapshot, initialState },
    ] = createState(0);

    assert.strictEqual(countSignal.value, 0);

    assert.strictEqual(initialState, 0);

    setCount(5);

    assert.strictEqual(countSignal.value, 5);

    updateState((prev) => prev + 1);

    assert.strictEqual(countSignal.value, 6);

    resetState();

    assert.strictEqual(countSignal.value, 0);

    assert.strictEqual(getSnapshot(), 0);

    // embed-sample-code-ignore-below
  });
}
