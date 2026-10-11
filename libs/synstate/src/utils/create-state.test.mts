import { createState } from './create-state.mjs';

describe(createState, () => {
  test('passes on every update when no `equals` is given, equal or not', () => {
    const [state, setState] = createState(0);

    const seen = record(state);

    setState(0);

    assert.deepStrictEqual(seen, [0, 0]);
  });

  test('with `equals`, setState, updateState and resetState do not pass on a value equal to the current one', () => {
    const [state, setState, { updateState, resetState }] = createState(0, {
      equals: Object.is,
    });

    const seen = record(state);

    assert.strictEqual(setState(0), 0);

    assert.strictEqual(
      updateState((current) => current),
      0,
    );

    assert.strictEqual(resetState(), 0);

    setState(1);

    assert.strictEqual(setState(1), 1);

    assert.deepStrictEqual(seen, [0, 1]);
  });

  // What `equals` is for: whatever reads the state, directly or through
  // anything derived from it, is told only of a real change, and an equal
  // value written over the current one leaves the object that is there.
  test('keeps the current object when `equals` finds the next one equal to it', () => {
    const [state, setState, { getSnapshot }] = createState<readonly number[]>(
      [1, 2],
      {
        equals: (current, next) =>
          current.length === next.length &&
          current.every((value, index) => value === next[index]),
      },
    );

    const held = getSnapshot();

    const seen = record(state);

    assert.strictEqual(setState([1, 2]), held);

    assert.strictEqual(getSnapshot(), held);

    assert.deepStrictEqual(seen, [held]);
  });
});

const record = <A,>(
  state: Readonly<{ subscribe: (onNext: (value: A) => void) => unknown }>,
): readonly A[] => {
  const mut_seen: A[] = [];

  state.subscribe((value) => {
    mut_seen.push(value);
  });

  return mut_seen;
};
