import { act, renderHook } from '@testing-library/react';
import {
  createBooleanState,
  createReducer,
  createState,
} from '../../src/index.mjs';

describe(createState, () => {
  test('re-renders the component that reads the state', () => {
    const [useCount, setCount, { updateState, resetState }] = createState(0);

    const { result } = renderHook(() => useCount());

    assert.strictEqual(result.current, 0);

    act(() => {
      setCount(5);
    });

    assert.strictEqual(result.current, 5);

    act(() => {
      updateState((prev) => prev + 1);
    });

    assert.strictEqual(result.current, 6);

    act(() => {
      resetState();
    });

    assert.strictEqual(result.current, 0);
  });

  test('gives every reader the same value', () => {
    const [useCount, setCount] = createState('a');

    const first = renderHook(() => useCount());

    const second = renderHook(() => useCount());

    act(() => {
      setCount('b');
    });

    assert.strictEqual(first.result.current, 'b');

    assert.strictEqual(second.result.current, 'b');
  });
});

describe(createReducer, () => {
  test('re-renders the component that reads the state', () => {
    const [useCount, dispatch] = createReducer(
      (state: number, action: 'decrement' | 'increment') =>
        action === 'increment' ? state + 1 : state - 1,
      0,
    );

    const { result } = renderHook(() => useCount());

    assert.strictEqual(result.current, 0);

    act(() => {
      dispatch('increment');
    });

    assert.strictEqual(result.current, 1);

    act(() => {
      dispatch('decrement');
    });

    assert.strictEqual(result.current, 0);
  });
});

describe(createBooleanState, () => {
  test('re-renders the component that reads the state', () => {
    const [useIsOpen, { setTrue: open, setFalse: close, toggle }] =
      createBooleanState(false);

    const { result } = renderHook(() => useIsOpen());

    assert.isFalse(result.current);

    act(() => {
      open();
    });

    assert.isTrue(result.current);

    act(() => {
      close();
    });

    assert.isFalse(result.current);

    act(() => {
      toggle();
    });

    assert.isTrue(result.current);
  });
});
