import { combine, map, type InitializedObservable } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import {
  fitTitle,
  NODE_HEIGHT,
  NODE_WIDTH,
  type DagNode,
} from '../../../domain/index.mjs';
import { SvgLink } from './svg-link.js';

export const DagNodeShape = ({
  placed,
  now,
}: Readonly<{
  placed: InitializedObservable<
    Readonly<{ node: DagNode; x: number; y: number }>
  >;
  now: InitializedObservable<number>;
}>): JSX.Element => {
  const node = placed.pipe(map((p) => p.node));

  const first = Optional.unwrap(node.getSnapshot());

  const title = node.pipe(map((n) => fitTitle(n.title, TITLE_UNITS)));

  return (
    <g
      class={constant('dag-node')}
      data-extra={node.pipe(map(({ extra }) => (extra ? 'true' : 'false')))}
      data-faint={node.pipe(map(({ faint }) => (faint ? 'true' : 'false')))}
      data-kind={constant(first.kind)}
      data-state={node.pipe(map(({ state }) => state))}
      transform={placed.pipe(map(({ x, y }) => `translate(${x},${y})`))}
    >
      <SvgLink
        href={first.url}
        title={combine([node, now]).pipe(
          map(([n, nowMs]) => tooltipOf(n, nowMs)),
        )}
      >
        <path
          class={constant('dag-shape')}
          d={constant(first.kind === 'issue' ? HEXAGON : ROUNDED)}
        />
        <rect
          class={constant('dag-number-pill')}
          height={constant('16')}
          rx={constant('8')}
          width={constant('52')}
          x={constant('12')}
          y={constant('6')}
        />
        <text
          class={constant('dag-number')}
          x={constant('38')}
          y={constant('18')}
        >
          {node.pipe(map(({ number }) => `#${number}`))}
        </text>
        <If
          cond={node.pipe(map(({ pill }) => pill !== undefined))}
          then={
            <g>
              <rect
                class={constant('dag-pill')}
                data-pill={node.pipe(map(({ pill }) => pill ?? ''))}
                height={constant('16')}
                rx={constant('8')}
                width={constant('40')}
                x={constant((NODE_WIDTH - 52).toString())}
                y={constant('6')}
              />
              <text
                class={constant('dag-pill-text')}
                data-pill={node.pipe(map(({ pill }) => pill ?? ''))}
                x={constant((NODE_WIDTH - 32).toString())}
                y={constant('18')}
              >
                {node.pipe(map(({ pill }) => pill ?? ''))}
              </text>
            </g>
          }
        />
        <If
          cond={node.pipe(map(({ claim }) => claim !== undefined))}
          then={
            <text
              class={constant('dag-claim')}
              data-stale={node.pipe(
                map(({ claim }) => (claim?.stale === true ? 'true' : 'false')),
              )}
              x={constant('72')}
              y={constant('18')}
            >
              {node.pipe(
                map(({ claim }) =>
                  claim?.stale === true ? '⚠ claimed' : '✋ claimed',
                ),
              )}
            </text>
          }
        />
        <text
          class={constant('dag-title')}
          x={constant('12')}
          y={constant('38')}
        >
          {title.pipe(map(([line]) => line))}
        </text>
        <text
          class={constant('dag-title')}
          x={constant('12')}
          y={constant('53')}
        >
          {title.pipe(map((lines) => lines[1] ?? ''))}
        </text>
      </SvgLink>
    </g>
  );
};

const HEXAGON =
  `M10,0 H${NODE_WIDTH - 10} L${NODE_WIDTH},${NODE_HEIGHT / 2} L${NODE_WIDTH - 10},${NODE_HEIGHT} H10 L0,${NODE_HEIGHT / 2} Z` as const;

const ROUNDED =
  `M8,0 H${NODE_WIDTH - 8} Q${NODE_WIDTH},0 ${NODE_WIDTH},8 V${NODE_HEIGHT - 8} Q${NODE_WIDTH},${NODE_HEIGHT} ${NODE_WIDTH - 8},${NODE_HEIGHT} H8 Q0,${NODE_HEIGHT} 0,${NODE_HEIGHT - 8} V8 Q0,0 8,0 Z` as const;

/** Title characters per line: wide ones count two. */
const TITLE_UNITS = 28;

const tooltipOf = (node: DagNode, nowMs: number): string =>
  [
    `#${node.number} ${node.title}`,
    STATE_WORDS[node.state],
    ...(node.claim === undefined
      ? []
      : [
          `${node.claim.state === 'started' ? 'Started' : 'Planned'} by ${node.claim.by}, ${Math.max(0, Math.round((nowMs - node.claim.atMs) / 3_600_000))} hours ago${node.claim.stale ? ': the session may have stopped' : ''}.`,
        ]),
    ...(node.extra ? ['Drawn because a drawn issue waits on it.'] : []),
  ].join('\n');

const STATE_WORDS = {
  ready: 'Can start: the wait is over.',
  free: 'Can start.',
  waiting: 'Waiting on something open.',
  planned: 'Planned.',
  'in-progress': 'In progress.',
  attention: 'Needs a look: it names something closed unfinished or unknown.',
  cycle: 'On a Start-After cycle.',
  pull: 'An open pull request.',
  closed: 'Closed unfinished.',
  unread: 'Open, but past what the list read: its own state is unknown.',
} as const;
