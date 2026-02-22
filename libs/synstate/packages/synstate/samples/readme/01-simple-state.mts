import { createState } from 'synstate';

if (import.meta.vitest !== undefined) {
  test('simple-state', () => {
    // embed-sample-code-ignore-above

    // Create a reactive state
    const [state, setState, { updateState, resetState, getSnapshot }] =
      createState(0);

    const mut_history: number[] = [];

    // Subscribe to changes (in React components, Vue watchers, etc.)
    state.subscribe((count) => {
      mut_history.push(count);
    });

    assert.deepStrictEqual(mut_history, [0]);

    // Update state
    setState(1);

    assert.deepStrictEqual(mut_history, [0, 1]);

    updateState((prev) => prev + 2);

    assert.deepStrictEqual(mut_history, [0, 1, 3]);

    assert.isTrue(getSnapshot() === 3);

    resetState();

    assert.isTrue(getSnapshot() === 0);

    // embed-sample-code-ignore-below
  });
}
