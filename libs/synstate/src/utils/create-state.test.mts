import { hasKey, isRecord } from 'ts-data-forge';
import { createState } from './create-state.mjs';

describe(createState, () => {
  test('setState, updateState and resetState do not pass on a value `Object.is`-equal to the current one when no `equals` is given', () => {
    const [state, setState, { updateState, resetState }] = createState(0);

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

  test('once the state is completed, setState, updateState and resetState return the current value', () => {
    const [state, setState, { updateState, resetState, getSnapshot }] =
      createState(0);

    setState(1);

    state.complete();

    assert.strictEqual(setState(2), 1);

    assert.strictEqual(
      updateState((current) => current + 1),
      1,
    );

    assert.strictEqual(resetState(), 1);

    assert.strictEqual(getSnapshot(), 1);
  });

  test('passes on every update, equal or not, with `equals: () => false`', () => {
    const [state, setState] = createState(0, { equals: () => false });

    const seen = record(state);

    setState(0);

    assert.deepStrictEqual(seen, [0, 0]);
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

  test('updateState compares the result with the state updateFn was given', () => {
    const [state, setState, { updateState }] = createState(0);

    const seen = record(state);

    // updateFn writes the state itself, then returns what it was given:
    // equal to that, so nothing more is written and 5 stays.
    updateState((prev) => {
      setState(5);

      return prev;
    });

    assert.deepStrictEqual(seen, [0, 5]);

    assert.strictEqual(state.getSnapshot().value, 5);
  });

  describe('keepEqualParts', () => {
    type Report = Readonly<{
      summary: Readonly<{ open: number }>;
      entries: readonly Readonly<{ number: number; title: string }>[];
    }>;

    const initial: Report = {
      summary: { open: 1 },
      entries: [{ number: 1, title: 'a' }],
    } as const;

    test('passes nothing on, and keeps the current object, when the next state is deeply equal', () => {
      const [state, setState, { getSnapshot }] = createState(initial, {
        keepEqualParts: true,
      });

      const seen = record(state);

      assert.strictEqual(
        setState({
          summary: { open: 1 },
          entries: [{ number: 1, title: 'a' }],
        }),
        initial,
      );

      assert.strictEqual(getSnapshot(), initial);

      assert.deepStrictEqual(seen, [initial]);
    });

    test('writes a new state whose unchanged branches are the current ones', () => {
      const [state, setState] = createState(initial, { keepEqualParts: true });

      const seen = record(state);

      const written = setState({
        summary: { open: 1 },
        entries: [
          { number: 1, title: 'a' },
          { number: 2, title: 'b' },
        ],
      });

      assert.deepStrictEqual(seen, [initial, written]);

      assert.strictEqual(written.summary, initial.summary);

      assert.strictEqual(written.entries[0], initial.entries[0]);
    });

    test('applies to `updateState` and matches items by `key`', () => {
      const [state, , { updateState }] = createState(initial, {
        keepEqualParts: {
          key: (item) =>
            isRecord(item) && hasKey(item, 'number') ? item.number : undefined,
        },
      });

      // A whole new object, as a server answer would be.
      const written = updateState(() => ({
        summary: { open: 1 },
        entries: [
          { number: 0, title: 'new' },
          { number: 1, title: 'a' },
        ],
      }));

      assert.strictEqual(written.summary, initial.summary);

      assert.strictEqual(written.entries[1], initial.entries[0]);

      assert.strictEqual(state.getSnapshot().value, written);
    });

    test('is off by default', () => {
      const [, setState] = createState(initial);

      const next: Report = {
        summary: { open: 1 },
        entries: [{ number: 1, title: 'a' }],
      } as const;

      assert.strictEqual(setState(next), next);
    });
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
