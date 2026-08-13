import { createBooleanState } from '../src/index.mjs';

describe('createBooleanState utils', () => {
  test('drives the underlying observable through the boolean shortcuts', () => {
    const [, { state, setTrue, setFalse, toggle, initialState }] =
      createBooleanState(false);

    assert.strictEqual(initialState, false);

    const mut_seen: boolean[] = [];

    state.subscribe((value) => {
      mut_seen.push(value);
    });

    setTrue();

    setFalse();

    toggle();

    assert.deepStrictEqual(mut_seen, [false, true, false, true]);
  });

  test('exposes the same utils as the underlying state', () => {
    const [, { setState, updateState, resetState, getSnapshot }] =
      createBooleanState(true);

    assert.strictEqual(setState(false), false);

    assert.strictEqual(
      updateState((prev) => !prev),
      true,
    );

    assert.strictEqual(getSnapshot(), true);

    assert.strictEqual(resetState(), true);
  });
});
