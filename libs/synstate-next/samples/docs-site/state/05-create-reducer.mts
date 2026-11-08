import { createReducer } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('createReducer', () => {
    // embed-sample-code-ignore-above
    type Action = Readonly<
      | { type: 'increment' }
      | { type: 'decrement' }
      | { type: 'set'; value: number }
    >;

    const reducer = (current: number, action: Action): number => {
      switch (action.type) {
        case 'increment':
          return current + 1;

        case 'decrement':
          return current - 1;

        case 'set':
          return action.value;
      }
    };

    const [count, dispatch, { getSnapshot }] = createReducer(reducer, 0);

    const mut_seen: number[] = [];

    count.subscribe((value) => {
      mut_seen.push(value);
    });

    dispatch({ type: 'increment' });

    dispatch({ type: 'increment' });

    dispatch({ type: 'set', value: 10 });

    dispatch({ type: 'decrement' });

    assert.strictEqual(getSnapshot(), 9);

    assert.deepStrictEqual(mut_seen, [0, 1, 2, 10, 9]);

    // embed-sample-code-ignore-below
  });
}
