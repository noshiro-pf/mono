import { createReducer } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('create-reducer', () => {
    // embed-sample-code-ignore-above
    type Action = Readonly<
      { type: 'increment' } | { type: 'add'; amount: number }
    >;

    const [count, dispatch, { getSnapshot }] = createReducer(
      (n: number, action: Action) =>
        action.type === 'increment' ? n + 1 : n + action.amount,
      0,
    );

    dispatch({ type: 'increment' });

    dispatch({ type: 'add', amount: 10 });

    assert.strictEqual(count.value, 11);

    assert.strictEqual(getSnapshot(), 11);

    // embed-sample-code-ignore-below
  });
}
