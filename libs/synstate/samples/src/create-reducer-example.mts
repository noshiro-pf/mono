import { createReducer } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(createReducer, () => {
    // embed-sample-code-ignore-above

    const [state, dispatch] = createReducer(
      (s, action: Readonly<{ type: 'increment' } | { type: 'decrement' }>) => {
        switch (action.type) {
          case 'increment':
            return s + 1;
          case 'decrement':
            return s - 1;
        }
      },
      0,
    );

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const stateHistory: number[] = [];

    state.subscribe((value: number) => {
      stateHistory.push(value);
    });

    assert.deepStrictEqual(stateHistory, [0]);

    dispatch({ type: 'increment' }); // logs: 1

    assert.deepStrictEqual(stateHistory, [0, 1]);

    dispatch({ type: 'increment' });

    dispatch({ type: 'decrement' });

    assert.deepStrictEqual(stateHistory, [0, 1, 2, 1]);

    // embed-sample-code-ignore-below
  });
}
