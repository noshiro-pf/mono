import { defineMachine } from 'ts-fsm-forge';

// embed-sample-code-ignore-above
type State = Readonly<
  | { type: 'idle' }
  | { type: 'loading'; startedAt: number }
  | { type: 'success'; data: string }
  | { type: 'failure'; message: string }
>;

type Action = Readonly<
  | { type: 'fetch'; now: number }
  | { type: 'resolve'; data: string }
  | { type: 'reject'; message: string }
  | { type: 'reset' }
>;

export const fetchMachine = defineMachine<State, Action>()(
  // The graph: state type -> action type -> target state type(s).
  {
    idle: { fetch: 'loading' },
    loading: { resolve: 'success', reject: 'failure', reset: 'idle' },
    success: { fetch: 'loading', reset: 'idle' },
    failure: { fetch: 'loading', reset: 'idle' },
  },
  // One handler per edge: `s` and `a` arrive narrowed, and the result must be
  // the edge's target (`loading` here), or the definition does not compile.
  {
    idle: { fetch: (_s, a) => ({ type: 'loading', startedAt: a.now }) },
    loading: {
      resolve: (_s, a) => ({ type: 'success', data: a.data }),
      reject: (_s, a) => ({ type: 'failure', message: a.message }),
      reset: () => ({ type: 'idle' }),
    },
    success: {
      fetch: (_s, a) => ({ type: 'loading', startedAt: a.now }),
      reset: () => ({ type: 'idle' }),
    },
    failure: {
      fetch: (_s, a) => ({ type: 'loading', startedAt: a.now }),
      reset: () => ({ type: 'idle' }),
    },
  },
);
// embed-sample-code-ignore-below

export type { Action, State };
