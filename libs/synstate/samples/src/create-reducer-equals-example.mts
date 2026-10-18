import { createReducer } from 'synstate';

if (import.meta.vitest !== undefined) {
  test('createReducer with equals', () => {
    // embed-sample-code-ignore-above

    const [count, dispatch] = createReducer(
      (s, action: Readonly<{ type: 'add'; amount: number }>) =>
        s + action.amount,
      0,
      { equals: () => false },
    );

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const countHistory: number[] = [];

    count.subscribe((value: number) => {
      countHistory.push(value);
    });

    dispatch({ type: 'add', amount: 0 }); // 0 again, passed on all the same

    dispatch({ type: 'add', amount: 2 });

    assert.deepStrictEqual(countHistory, [0, 0, 2]);

    // embed-sample-code-ignore-below
  });
}
