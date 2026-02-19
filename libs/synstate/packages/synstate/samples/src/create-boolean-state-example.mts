import { createBooleanState } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(createBooleanState, () => {
    // embed-sample-code-ignore-above

    const [state, { setTrue, toggle }] = createBooleanState(false);

    const mut_history: boolean[] = [];

    state.subscribe((value: boolean) => {
      mut_history.push(value);
    });

    assert.deepStrictEqual(mut_history, [false]);

    setTrue(); // logs: true

    assert.deepStrictEqual(mut_history, [false, true]);

    toggle(); // logs: false

    assert.deepStrictEqual(mut_history, [false, true, false]);

    toggle(); // logs: true

    assert.deepStrictEqual(mut_history, [false, true, false, true]);

    // embed-sample-code-ignore-below
  });
}
