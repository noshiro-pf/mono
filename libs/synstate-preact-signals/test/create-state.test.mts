import { createState } from '../src/index.mjs';

describe(createState, () => {
  test('exposes the state through a signal and through the utils', () => {
    const [
      countSignal,
      setCount,
      { updateState, resetState, getSnapshot, initialState },
    ] = createState(0);

    assert.strictEqual(countSignal.value, 0);

    assert.strictEqual(initialState, 0);

    setCount(5);

    assert.strictEqual(countSignal.value, 5);

    assert.strictEqual(getSnapshot(), 5);

    updateState((prev) => prev + 1);

    assert.strictEqual(countSignal.value, 6);

    resetState();

    assert.strictEqual(countSignal.value, 0);

    assert.strictEqual(getSnapshot(), 0);
  });

  test('returns the value that was set', () => {
    const [, setCount, { updateState, resetState }] = createState(1);

    assert.strictEqual(setCount(2), 2);

    assert.strictEqual(
      updateState((prev) => prev * 10),
      20,
    );

    assert.strictEqual(resetState(), 1);
  });

  test('feeds the underlying observable', () => {
    const [, setCount, { state }] = createState(0);

    const mut_seen: number[] = [];

    state.subscribe((value) => {
      mut_seen.push(value);
    });

    setCount(1);

    setCount(2);

    assert.deepStrictEqual(mut_seen, [0, 1, 2]);
  });
});
