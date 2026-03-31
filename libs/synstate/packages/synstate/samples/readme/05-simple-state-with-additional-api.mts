import { createState } from 'synstate';

if (import.meta.vitest !== undefined) {
  test('simple-state', () => {
    // embed-sample-code-ignore-above

    // Create a reactive state
    const [state, setState, { updateState, resetState, getSnapshot }] =
      createState(0);
    // type of state: InitializedObservable<number>
    // type of setState: (v: number) => number
    // type of updateState: (updater: (prev: number) => number) => number
    // type of resetState: () => void
    // type of getSnapshot: () => number

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const stateHistory: number[] = [];

    // Subscribe to changes
    state.subscribe((count) => {
      stateHistory.push(count);
    });

    assert.deepStrictEqual(stateHistory, [0]);

    assert.strictEqual(getSnapshot(), 0);

    // Update state
    setState(1);

    assert.strictEqual(getSnapshot(), 1);

    assert.deepStrictEqual(stateHistory, [0, 1]);

    updateState((prev) => prev + 2);

    assert.strictEqual(getSnapshot(), 3);

    assert.deepStrictEqual(stateHistory, [0, 1, 3]);

    resetState();

    assert.strictEqual(getSnapshot(), 0);

    assert.deepStrictEqual(stateHistory, [0, 1, 3, 0]);

    // embed-sample-code-ignore-below
  });
}
