import { constant, type JSX } from 'synstate-dom';

/**
 * What the DAG's shapes, colours and outlines say: the two shapes, each state,
 * the dashed edge to the pull request that closes an issue, and how a tier is
 * drawn.
 */
export const DagLegend = (): JSX.Element => (
  <ul aria-label={constant('Legend')} class={constant('dag-legend')}>
    {ITEMS.map(([mark, state, word]) => (
      <li>
        <svg
          aria-hidden={constant('true')}
          class={constant('dag-legend-mark')}
          viewBox={constant('0 0 24 14')}
        >
          <g
            class={constant('dag-node')}
            data-faint={constant(mark === 'faint' ? 'true' : 'false')}
            data-state={constant(state)}
          >
            {mark === 'closes' ? (
              <path
                class={constant('dag-edge dag-edge-closes')}
                d={constant('M1,7 H23')}
              />
            ) : mark === 'ring' ? (
              <>
                <rect
                  class={constant('dag-ring')}
                  height={constant('13')}
                  rx={constant('6.5')}
                  width={constant('23')}
                  x={constant('0.5')}
                  y={constant('0.5')}
                />
                <rect
                  class={constant('dag-shape')}
                  height={constant('7')}
                  rx={constant('3.5')}
                  width={constant('17')}
                  x={constant('3.5')}
                  y={constant('3.5')}
                />
              </>
            ) : (
              <path class={constant('dag-shape')} d={constant(SHAPES[mark])} />
            )}
          </g>
        </svg>
        {constant(word)}
      </li>
    ))}
  </ul>
);

const SHAPES = {
  issue: 'M5,1 H19 L23,7 L19,13 H5 L1,7 Z',
  pull: 'M7,1 H17 A6,6 0 0 1 17,13 H7 A6,6 0 0 1 7,1 Z',
  state: 'M3,2 H21 Q22,2 22,3 V11 Q22,12 21,12 H3 Q2,12 2,11 V3 Q2,2 3,2 Z',
  faint: 'M7,2 H17 A5,5 0 0 1 17,12 H7 A5,5 0 0 1 7,2 Z',
} as const;

const ITEMS = [
  ['issue', 'neutral', 'Issue'],
  ['pull', 'neutral', 'Pull request'],
  ['state', 'free', 'Can start'],
  ['state', 'ready', 'Can start, wait over'],
  ['state', 'planned', 'Planned'],
  ['state', 'in-progress', 'In progress'],
  ['state', 'waiting', 'Waiting'],
  ['state', 'attention', 'Needs a look'],
  ['state', 'cycle', 'Cycle'],
  ['state', 'closed', 'Closed unfinished'],
  ['state', 'unread', 'Open, not read'],
  ['pull', 'pull', 'Open pull request'],
  ['closes', 'pull', 'Closed by'],
  ['ring', 'neutral', 'Priority S or A'],
  ['faint', 'neutral', 'Priority D, hold or close'],
] as const;
