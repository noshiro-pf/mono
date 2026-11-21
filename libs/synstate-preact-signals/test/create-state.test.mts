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

  test('writes what the setters are given', () => {
    const [, setCount, { updateState, resetState, getSnapshot }] =
      createState(1);

    setCount(2);

    assert.strictEqual(getSnapshot(), 2);

    updateState((prev) => prev * 10);

    assert.strictEqual(getSnapshot(), 20);

    resetState();

    assert.strictEqual(getSnapshot(), 1);
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

describe('createState with equals', () => {
  test('passes on only the updates that change the state', () => {
    const [, setCount, { state }] = createState(0, { equals: Object.is });

    const mut_seen: number[] = [];

    state.subscribe((value) => {
      mut_seen.push(value);
    });

    setCount(0);

    setCount(1);

    setCount(1);

    assert.deepStrictEqual(mut_seen, [0, 1]);
  });
});
