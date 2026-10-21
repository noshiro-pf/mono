import { createBooleanState } from './create-boolean-state.mjs';

describe(createBooleanState, () => {
  test('setting what it already holds passes nothing on when no `equals` is given', () => {
    const [state, { setTrue, setFalse }] = createBooleanState(false);

    const mut_seen: boolean[] = [];

    state.subscribe((value) => {
      mut_seen.push(value);
    });

    setFalse();

    setTrue();

    setTrue();

    assert.deepStrictEqual(mut_seen, [false, true]);
  });

  test('passes on every update, equal or not, with `equals: () => false`', () => {
    const [state, { setTrue }] = createBooleanState(true, {
      equals: () => false,
    });

    const mut_seen: boolean[] = [];

    state.subscribe((value) => {
      mut_seen.push(value);
    });

    setTrue();

    assert.deepStrictEqual(mut_seen, [true, true]);
  });
});
