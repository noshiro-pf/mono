import { createState, filter, mapTo } from 'synstate';
import { match } from 'ts-data-forge';
import {
  createReducerWithActions,
  createToggleState,
} from './create-reducer-with-actions.mjs';

describe('createReducerWithActions', () => {
  test('follows both dispatch and the actions, without a warning', () => {
    const [page$, setPage] = createState<'form' | 'other'>('form');

    const warn = captureWarnings(() => {
      const [, dispatch, { state, getSnapshot }] = createReducerWithActions(
        (_: string, action: 'input' | 'reset') =>
          match(action, { input: 'a', reset: '' }),
        '',
        [page$.pipe(filter((page) => page !== 'form')).pipe(mapTo('reset'))],
      );

      const mut_history: string[] = [];

      state.subscribe((text) => {
        mut_history.push(text);
      });

      assert.strictEqual(dispatch('input'), 'a');

      setPage('other');

      assert.strictEqual(getSnapshot(), '');

      assert.deepStrictEqual(mut_history, ['', 'a', '']);
    });

    assert.deepStrictEqual(warn, []);
  });
});

describe('createToggleState', () => {
  test('toggles, and goes back to false on a reset', () => {
    const [closed$, setClosed] = createState(false);

    const { state, toggle } = createToggleState([
      closed$.pipe(filter((isClosed) => isClosed)),
    ]);

    toggle();

    assert.isTrue(state.getSnapshot().value);

    setClosed(true);

    assert.isFalse(state.getSnapshot().value);
  });
});

/**
 * Runs `run` with `console.warn` replaced by a mock, and returns the messages
 * it was called with.
 */
const captureWarnings = (run: () => void): readonly unknown[] => {
  const warn = vi.fn();

  vi.stubGlobal('console', { ...console, warn });

  run();

  // cspell:disable-next-line
  vi.unstubAllGlobals();

  return warn.mock.calls.map((args: readonly unknown[]) => args[0]);
};
