import { createReducer } from '../src/index.mjs';

type Action = Readonly<{ type: 'increment' } | { type: 'decrement' }>;

const countReducer = (state: number, action: Action): number =>
  action.type === 'increment' ? state + 1 : state - 1;

describe('createReducer utils', () => {
  test('applies each dispatched action to the underlying observable', () => {
    const [, dispatch, { state, getSnapshot, initialState }] = createReducer(
      countReducer,
      0,
    );

    assert.strictEqual(initialState, 0);

    const mut_seen: number[] = [];

    state.subscribe((value) => {
      mut_seen.push(value);
    });

    dispatch({ type: 'increment' });

    dispatch({ type: 'increment' });

    dispatch({ type: 'decrement' });

    assert.deepStrictEqual(mut_seen, [0, 1, 2, 1]);

    assert.strictEqual(getSnapshot(), 1);
  });

  test('returns the next state from dispatch', () => {
    const [, dispatch] = createReducer(countReducer, 10);

    assert.strictEqual(dispatch({ type: 'decrement' }), 9);
  });
});
