import { fetchMachine, type State } from './00-fetch-machine.mjs';

if (import.meta.vitest !== undefined) {
  test('transition', () => {
    const current = (): State => ({ type: 'loading', startedAt: 0 }) as const;

    // embed-sample-code-ignore-above
    const s: State = current();

    // `transition` takes only what the graph allows from the state's type, and
    // returns the edge's target type.
    if (s.type === 'loading') {
      const next = fetchMachine.transition(s, { type: 'resolve', data: 'ok' });

      next satisfies Readonly<{ type: 'success'; data: string }>;

      assert.deepStrictEqual(next, { type: 'success', data: 'ok' });
    }

    assert.throws(() => {
      // @ts-expect-error `idle` has no `resolve` edge.
      fetchMachine.transition({ type: 'idle' }, { type: 'resolve', data: '' });
    });

    // `can` narrows a state to the types that have the edge.
    if (fetchMachine.can(s, 'reset')) {
      s satisfies Readonly<{ type: 'loading' | 'success' | 'failure' }>;

      assert.deepStrictEqual(fetchMachine.transition(s, { type: 'reset' }), {
        type: 'idle',
      });
    }

    // What a UI may offer in a state:
    assert.deepStrictEqual(fetchMachine.allowedActionTypes(s), [
      'resolve',
      'reject',
      'reset',
    ]);
    // embed-sample-code-ignore-below
  });
}
