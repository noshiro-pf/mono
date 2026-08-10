import { createReducer } from 'synstate-preact-signals';

if (import.meta.vitest !== undefined) {
  test('createReducer', () => {
    // embed-sample-code-ignore-above

    type Action = Readonly<{ type: 'increment' } | { type: 'decrement' }>;

    const [countSignal, dispatch, { getSnapshot }] = createReducer(
      (state: number, action: Action) =>
        action.type === 'increment' ? state + 1 : state - 1,
      0,
    );

    assert.strictEqual(countSignal.value, 0);

    dispatch({ type: 'increment' });

    assert.strictEqual(countSignal.value, 1);

    dispatch({ type: 'increment' });

    assert.strictEqual(countSignal.value, 2);

    dispatch({ type: 'decrement' });

    assert.strictEqual(countSignal.value, 1);

    assert.strictEqual(getSnapshot(), 1);

    // embed-sample-code-ignore-below
  });
}
