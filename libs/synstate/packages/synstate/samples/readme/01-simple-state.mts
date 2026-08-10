import { createState } from 'synstate';

if (import.meta.vitest !== undefined) {
  test('simple-state', () => {
    // embed-sample-code-ignore-above

    // Create a reactive state
    const [state, setState] = createState(0);
    // type of state: InitializedObservable<number>
    // type of setState: (v: number) => number

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const stateHistory: number[] = [];

    // Subscribe to changes
    state.subscribe((count) => {
      stateHistory.push(count);
    });

    assert.deepStrictEqual(stateHistory, [0]);

    // Update state
    setState(1);

    assert.deepStrictEqual(stateHistory, [0, 1]);

    // embed-sample-code-ignore-below
  });
}
