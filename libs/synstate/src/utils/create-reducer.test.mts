import type { FixedLengthTuple } from 'ts-type-forge';
import { createReducer } from './create-reducer.mjs';

describe(createReducer, () => {
  test('does not pass on a dispatch whose next state is `Object.is`-equal to the current one when no `equals` is given', () => {
    const [state, dispatch, { getSnapshot }] = createReducer(keepOrAdd, 0);

    const seen = record(state);

    assert.strictEqual(dispatch({ type: 'keep' }), 0);

    assert.strictEqual(dispatch({ type: 'add', amount: 1 }), 1);

    assert.strictEqual(dispatch({ type: 'add', amount: 0 }), 1);

    assert.deepStrictEqual(seen, [0, 1]);

    assert.strictEqual(getSnapshot(), 1);
  });

  test('compares with `Object.is` by default, so `NaN` equals itself and `-0` differs from `0`', () => {
    const [state, dispatch] = createReducer(
      (_current: number, next: number) => next,
      0,
    );

    const seen = record(state);

    dispatch(-0);

    dispatch(Number.NaN);

    dispatch(Number.NaN);

    assert.deepStrictEqual(seen, [0, -0, Number.NaN]);
  });

  test('passes on every dispatch, equal or not, with `equals: () => false`', () => {
    const [state, dispatch] = createReducer(keepOrAdd, 0, {
      equals: () => false,
    });

    const seen = record(state);

    dispatch({ type: 'keep' });

    dispatch({ type: 'add', amount: 1 });

    assert.deepStrictEqual(seen, [0, 0, 1]);
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

  test('once the state is completed, a dispatch returns the current state', () => {
    const [state, dispatch, { getSnapshot }] = createReducer(keepOrAdd, 0);

    dispatch({ type: 'add', amount: 1 });

    state.complete();

    assert.strictEqual(dispatch({ type: 'add', amount: 2 }), 1);

    assert.strictEqual(getSnapshot(), 1);
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
