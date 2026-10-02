import { type FixedLengthTuple } from 'ts-type-forge';
import { createReducer } from './create-reducer.mjs';

describe(createReducer, () => {
  test('passes on every dispatch when no `equals` is given, equal or not', () => {
    const [state, dispatch] = createReducer(keepOrAdd, 0);

    const seen = record(state);

    dispatch({ type: 'keep' });

    dispatch({ type: 'add', amount: 1 });

    assert.deepStrictEqual(seen, [0, 0, 1]);
  });

  test('with `equals`, does not pass on a dispatch whose next state is equal to the current one', () => {
    const [state, dispatch, { getSnapshot }] = createReducer(keepOrAdd, 0, {
      equals: Object.is,
    });

    const seen = record(state);

    assert.strictEqual(dispatch({ type: 'keep' }), 0);

    assert.strictEqual(dispatch({ type: 'add', amount: 1 }), 1);

    assert.strictEqual(dispatch({ type: 'add', amount: 0 }), 1);

    assert.deepStrictEqual(seen, [0, 1]);

    assert.strictEqual(getSnapshot(), 1);
  });

  test('keeps the current object when `equals` finds the next one equal to it', () => {
    const initial = { count: 0 } as const;

    const [state, dispatch, { getSnapshot }] = createReducer(
      (_current: Count, next: Count) => next,
      initial,
      { equals: (current, next) => current.count === next.count },
    );

    const seen = record(state);

    assert.strictEqual(dispatch({ count: 0 }), initial);

    assert.strictEqual(getSnapshot(), initial);

    assert.deepStrictEqual(seen, [initial]);
  });

  test('asks `equals` with the current state first and the next one second', () => {
    const mut_asked: FixedLengthTuple<2, number>[] = [];

    const [, dispatch] = createReducer(keepOrAdd, 0, {
      equals: (current, next) => {
        mut_asked.push([current, next]);

        return false;
      },
    });

    dispatch({ type: 'add', amount: 5 });

    assert.deepStrictEqual(mut_asked, [[0, 5]]);
  });
});

type Count = Readonly<{ count: number }>;

type KeepOrAdd = Readonly<{ type: 'keep' } | { type: 'add'; amount: number }>;

const keepOrAdd = (current: number, action: KeepOrAdd): number =>
  action.type === 'keep' ? current : current + action.amount;

const record = <A,>(
  state: Readonly<{ subscribe: (onNext: (value: A) => void) => unknown }>,
): readonly A[] => {
  const mut_seen: A[] = [];

  state.subscribe((value) => {
    mut_seen.push(value);
  });

  return mut_seen;
};
