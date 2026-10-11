import { createBooleanState } from './create-boolean-state.mjs';

describe(createBooleanState, () => {
  test('with `equals`, setting what it already holds passes nothing on', () => {
    const [state, { setTrue, setFalse }] = createBooleanState(false, {
      equals: Object.is,
    });

    const mut_seen: boolean[] = [];

    state.subscribe((value) => {
      mut_seen.push(value);
    });

    setFalse();

    setTrue();

    setTrue();

    assert.deepStrictEqual(mut_seen, [false, true]);
  });
});
