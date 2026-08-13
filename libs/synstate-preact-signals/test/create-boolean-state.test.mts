import { createBooleanState } from '../src/index.mjs';

describe(createBooleanState, () => {
  test('reflects each of the boolean shortcuts in the signal', () => {
    const [isOpenSignal, { setTrue: open, setFalse: close, toggle }] =
      createBooleanState(false);

    assert.strictEqual(isOpenSignal.value, false);

    open();

    assert.strictEqual(isOpenSignal.value, true);

    close();

    assert.strictEqual(isOpenSignal.value, false);

    toggle();

    assert.strictEqual(isOpenSignal.value, true);
  });

  test('exposes the same utils as the underlying state', () => {
    const [flagSignal, { setState, updateState, resetState, getSnapshot }] =
      createBooleanState(true);

    setState(false);

    assert.strictEqual(flagSignal.value, false);

    updateState((prev) => !prev);

    assert.strictEqual(flagSignal.value, true);

    assert.strictEqual(getSnapshot(), true);

    resetState();

    assert.strictEqual(flagSignal.value, true);
  });
});
