import { fetchMachine, type Action, type State } from './00-fetch-machine.mjs';

if (import.meta.vitest !== undefined) {
  test('reducer', () => {
    // embed-sample-code-ignore-above
    // A plain `(state, action) => state`: hand it to `useReducer`, Redux, or
    // `Array.prototype.reduce` over a log of actions.
    const { reducer } = fetchMachine;

    const idle: State = { type: 'idle' } as const;

    assert.deepStrictEqual(reducer(idle, { type: 'fetch', now: 1 }), {
      type: 'loading',
      startedAt: 1,
    });

    // A pair the graph leaves out returns the same state.
    assert.strictEqual(reducer(idle, { type: 'resolve', data: 'early' }), idle);

    const log: readonly Action[] = [
      { type: 'resolve', data: 'early' }, // ignored: `idle` has no `resolve`
      { type: 'fetch', now: 1 },
      { type: 'fetch', now: 2 }, // ignored: `loading` has no `fetch`
      { type: 'resolve', data: 'ok' },
    ] as const;

    assert.deepStrictEqual(log.reduce(reducer, idle), {
      type: 'success',
      data: 'ok',
    });
    // embed-sample-code-ignore-below
  });
}
