import { createState } from '../src/index.mjs';

describe('createState utils', () => {
  test('exposes the initial state and the underlying observable', () => {
    const [, setCount, { state, getSnapshot, initialState }] = createState(0);

    assert.strictEqual(initialState, 0);

    assert.strictEqual(getSnapshot(), 0);

    const mut_seen: number[] = [];

    state.subscribe((value) => {
      mut_seen.push(value);
    });

    setCount(1);

    setCount(2);

    assert.deepStrictEqual(mut_seen, [0, 1, 2]);
  });

  test('returns the value that was set', () => {
    const [, setCount, { updateState, resetState, getSnapshot }] =
      createState(1);

    assert.strictEqual(setCount(2), 2);

    assert.strictEqual(
      updateState((prev) => prev * 10),
      20,
    );

    assert.strictEqual(resetState(), 1);

    assert.strictEqual(getSnapshot(), 1);
  });
});
