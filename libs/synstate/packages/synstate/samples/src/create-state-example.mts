import { createState } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(createState, () => {
    // embed-sample-code-ignore-above

    const [state, setState, { updateState, resetState }] = createState(0);

    const mut_history: number[] = [];

    state.subscribe((value: number) => {
      mut_history.push(value);
    });

    assert.deepStrictEqual(mut_history, [0]);

    setState(10); // logs: 10

    assert.deepStrictEqual(mut_history, [0, 10]);

    updateState((prev: number) => prev + 1); // logs: 11

    assert.deepStrictEqual(mut_history, [0, 10, 11]);

    resetState(); // logs: 0

    assert.deepStrictEqual(mut_history, [0, 10, 11, 0]);

    // embed-sample-code-ignore-below
  });
}
