import { createState } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(createState, () => {
    // embed-sample-code-ignore-above

    const [state, setState, { updateState, resetState }] = createState(0);

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const stateHistory: number[] = [];

    state.subscribe((value: number) => {
      stateHistory.push(value);
    });

    assert.deepStrictEqual(stateHistory, [0]);

    setState(10); // logs: 10

    assert.deepStrictEqual(stateHistory, [0, 10]);

    updateState((prev: number) => prev + 1); // logs: 11

    assert.deepStrictEqual(stateHistory, [0, 10, 11]);

    resetState(); // logs: 0

    assert.deepStrictEqual(stateHistory, [0, 10, 11, 0]);

    // embed-sample-code-ignore-below
  });
}
