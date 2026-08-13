import { act, renderHook } from '@testing-library/preact';
import {
  createBooleanState,
  createReducer,
  createState,
} from '../../src/index.mjs';

describe(createState, () => {
  test('re-renders the component that reads the state', async () => {
    const [useCount, setCount, { updateState, resetState }] = createState(0);

    const { result } = renderHook(() => useCount());

    assert.strictEqual(result.current, 0);

    await act(() => {
      setCount(5);
    });

    assert.strictEqual(result.current, 5);

    await act(() => {
      updateState((prev) => prev + 1);
    });

    assert.strictEqual(result.current, 6);

    await act(() => {
      resetState();
    });

    assert.strictEqual(result.current, 0);
  });

  test('gives every reader the same value', async () => {
    const [useCount, setCount] = createState('a');

    const first = renderHook(() => useCount());

    const second = renderHook(() => useCount());

    await act(() => {
      setCount('b');
    });

    assert.strictEqual(first.result.current, 'b');

    assert.strictEqual(second.result.current, 'b');
  });
});

describe(createReducer, () => {
  test('re-renders the component that reads the state', async () => {
    const [useCount, dispatch] = createReducer(
      (state: number, action: 'decrement' | 'increment') =>
        action === 'increment' ? state + 1 : state - 1,
      0,
    );

    const { result } = renderHook(() => useCount());

    assert.strictEqual(result.current, 0);

    await act(() => {
      dispatch('increment');
    });

    assert.strictEqual(result.current, 1);

    await act(() => {
      dispatch('decrement');
    });

    assert.strictEqual(result.current, 0);
  });
});

describe(createBooleanState, () => {
  test('re-renders the component that reads the state', async () => {
    const [useIsOpen, { setTrue: open, setFalse: close, toggle }] =
      createBooleanState(false);

    const { result } = renderHook(() => useIsOpen());

    assert.isFalse(result.current);

    await act(() => {
      open();
    });

    assert.isTrue(result.current);

    await act(() => {
      close();
    });

    assert.isFalse(result.current);

    await act(() => {
      toggle();
    });

    assert.isTrue(result.current);
  });
});
