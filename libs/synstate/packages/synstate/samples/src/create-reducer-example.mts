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

    const mut_history: number[] = [];

    state.subscribe((value: number) => {
      mut_history.push(value);
    });

    assert.deepStrictEqual(mut_history, [0]);

    dispatch({ type: 'increment' }); // logs: 1

    assert.deepStrictEqual(mut_history, [0, 1]);

    dispatch({ type: 'increment' });

    dispatch({ type: 'decrement' });

    assert.deepStrictEqual(mut_history, [0, 1, 2, 1]);

    // embed-sample-code-ignore-below
  });
}
