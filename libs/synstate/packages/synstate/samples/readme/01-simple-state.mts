import { createState } from 'synstate';

if (import.meta.vitest !== undefined) {
  test('simple-state', () => {
    // embed-sample-code-ignore-above

    // Create a reactive state
    const [state, setState, { updateState }] = createState(0);

    const mut_history: number[] = [];

    // Subscribe to changes (in React components, Vue watchers, etc.)
    state.subscribe((count: number) => {
      mut_history.push(count);
    });

    assert.deepStrictEqual(mut_history, [0]);

    // Update state
    setState(1);

    assert.deepStrictEqual(mut_history, [0, 1]);

    updateState((prev: number) => prev + 1);

    assert.deepStrictEqual(mut_history, [0, 1, 2]);

    // embed-sample-code-ignore-below
  });
}
