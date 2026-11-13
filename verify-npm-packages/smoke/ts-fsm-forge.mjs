import * as assert from 'node:assert/strict';
import { defineMachine, toMermaid } from 'ts-fsm-forge';

const machine = defineMachine()(
  { idle: { fetch: 'loading' }, loading: { reset: 'idle' } },
  {
    idle: { fetch: (_s, a) => ({ type: 'loading', startedAt: a.now }) },
    loading: { reset: () => ({ type: 'idle' }) },
  },
);

const idle = { type: 'idle' };

assert.deepEqual(machine.reducer(idle, { type: 'fetch', now: 1 }), {
  type: 'loading',
  startedAt: 1,
});

assert.equal(machine.reducer(idle, { type: 'reset' }), idle);

assert.throws(() => machine.transition(idle, { type: 'reset' }), /no edge/u);

assert.equal(machine.can({ type: 'loading', startedAt: 0 }, 'reset'), true);

assert.match(toMermaid(machine.graph), /^stateDiagram-v2\n/u);

console.info('ts-fsm-forge: ok');
