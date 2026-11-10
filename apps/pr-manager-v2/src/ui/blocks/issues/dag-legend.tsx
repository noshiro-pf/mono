import { constant, type JSX } from 'synstate-dom';

/** What the DAG's shapes and colours say. */
export const DagLegend = (): JSX.Element => (
  <ul aria-label={constant('Legend')} class={constant('dag-legend')}>
    {ITEMS.map(([state, kind, word]) => (
      <li>
        <svg
          aria-hidden={constant('true')}
          class={constant('dag-legend-mark')}
          viewBox={constant('0 0 28 16')}
        >
          <g
            class={constant('dag-node')}
            data-kind={constant(kind)}
            data-state={constant(state)}
          >
            <path
              class={constant('dag-shape')}
              d={constant(
                kind === 'issue'
                  ? 'M4,1 H24 L27,8 L24,15 H4 L1,8 Z'
                  : 'M4,1 H24 Q27,1 27,4 V12 Q27,15 24,15 H4 Q1,15 1,12 V4 Q1,1 4,1 Z',
              )}
            />
          </g>
        </svg>
        {constant(word)}
      </li>
    ))}
    <li>
      <svg
        aria-hidden={constant('true')}
        class={constant('dag-legend-mark')}
        viewBox={constant('0 0 28 16')}
      >
        <path
          class={constant('dag-edge dag-edge-closes')}
          d={constant('M1,8 H27')}
        />
      </svg>
      {constant('closed by')}
    </li>
  </ul>
);

const ITEMS = [
  ['ready', 'issue', 'can start, wait over'],
  ['free', 'issue', 'can start'],
  ['waiting', 'issue', 'waiting'],
  ['planned', 'issue', 'planned'],
  ['in-progress', 'issue', 'in progress'],
  ['attention', 'issue', 'needs a look'],
  ['cycle', 'issue', 'cycle'],
  ['closed', 'issue', 'closed unfinished'],
  ['unread', 'issue', 'open, not read'],
  ['pull', 'pull', 'open pull request'],
] as const;
