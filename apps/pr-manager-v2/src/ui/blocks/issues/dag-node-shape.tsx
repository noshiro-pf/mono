import { derive, map, type InitializedObservable } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import { asNonZeroFiniteNumber, Num, Optional } from 'ts-data-forge';
import {
  fitTitle,
  NODE_HEIGHT,
  NODE_WIDTH,
  PILL_HEIGHT,
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

  const issue = first.kind === 'issue';

  const lines = node.pipe(map((n) => fitTitle(n.title, TITLE_UNITS)));

  const numberWidth = pillWidthOf(`#${first.number}`);

  return (
    <g
      class={constant('dag-node')}
      data-extra={node.pipe(map(({ extra }) => (extra ? 'true' : 'false')))}
      data-faint={node.pipe(
        map(({ faint, pill }) => (faint || isFaded(pill) ? 'true' : 'false')),
      )}
      data-kind={constant(first.kind)}
      data-state={node.pipe(map(({ state }) => state))}
      transform={placed.pipe(map(({ x, y }) => `translate(${x},${y})`))}
    >
      <SvgLink
        href={first.url}
        title={derive([node, now], (n, nowMs) => tooltipOf(n, nowMs))}
      >
        <If
          cond={node.pipe(map(({ pill }) => isRinged(pill)))}
          then={
            <path
              class={constant('dag-ring')}
              d={constant(issue ? ISSUE_RING : ROUNDED_RING)}
            />
          }
        />
        <path
          class={constant('dag-shape')}
          d={constant(issue ? HEXAGON : ROUNDED)}
        />
        <text class={constant('dag-title')}>
          <tspan
            x={constant(NODE_WIDTH / 2)}
            y={lines.pipe(map((l) => lineY(0, l.length).toString()))}
          >
            {lines.pipe(map(([line]) => line))}
          </tspan>
          <tspan
            x={constant(NODE_WIDTH / 2)}
            y={lines.pipe(map((l) => lineY(1, l.length).toString()))}
          >
            {lines.pipe(map((l) => l[1] ?? ''))}
          </tspan>
        </text>
        <g
          class={constant('dag-number')}
          transform={constant(`translate(${PILL_X},${-PILL_HEIGHT / 2})`)}
        >
          <rect
            height={constant(PILL_HEIGHT)}
            rx={constant(PILL_HEIGHT / 2)}
            width={constant(numberWidth)}
          />
          <text x={constant(numberWidth / 2)} y={constant(PILL_HEIGHT / 2)}>
            {constant(`#${first.number}`)}
          </text>
        </g>
        <If
          cond={node.pipe(map(({ claim }) => claim !== undefined))}
          then={
            <g
              class={constant('dag-claim')}
              data-stale={node.pipe(
                map(({ claim }) => (claim?.stale === true ? 'true' : 'false')),
              )}
              transform={constant(
                `translate(${PILL_X + numberWidth + 4},${-PILL_HEIGHT / 2})`,
              )}
            >
              <rect
                height={constant(PILL_HEIGHT)}
                rx={constant(PILL_HEIGHT / 2)}
                width={constant(CLAIM_WIDTH)}
              />
              <text x={constant(CLAIM_WIDTH / 2)} y={constant(PILL_HEIGHT / 2)}>
                {node.pipe(
                  map(({ claim }) =>
                    claim?.stale === true ? '⚠ claimed' : '✋ claimed',
                  ),
                )}
              </text>
            </g>
          }
        />
        <If
          cond={node.pipe(map(({ pill }) => pill !== undefined))}
          then={
            <g
              class={constant('dag-pill')}
              data-pill={node.pipe(map(({ pill }) => pill ?? ''))}
              transform={constant(
                `translate(${NODE_WIDTH - PILL_X - TIER_WIDTH},${-PILL_HEIGHT / 2})`,
              )}
            >
              <rect
                height={constant(PILL_HEIGHT)}
                rx={constant(PILL_HEIGHT / 2)}
                width={constant(TIER_WIDTH)}
              />
              <text x={constant(TIER_WIDTH / 2)} y={constant(PILL_HEIGHT / 2)}>
                {node.pipe(map(({ pill }) => pill ?? ''))}
              </text>
            </g>
          }
        />
      </SvgLink>
    </g>
  );
};

/** Where the straight part of the top edge starts, for either shape. */
const PILL_X = NODE_HEIGHT / 2;

/** Wide enough for `close` in 10px bold. */
const TIER_WIDTH = 36;

const CLAIM_WIDTH = 60;

const INSET = 12;

/** How far the ring of an S or A node stands off its edge. */
const RING_GAP = 4;

const LINE_HEIGHT = 15;

/** Title characters per line inside the pointed ends: wide ones count two. */
const TITLE_UNITS = 26;

const HEXAGON =
  `M${INSET},0 H${NODE_WIDTH - INSET} L${NODE_WIDTH},${NODE_HEIGHT / 2} L${NODE_WIDTH - INSET},${NODE_HEIGHT} H${INSET} L0,${NODE_HEIGHT / 2} Z` as const;

// The hexagon grown by the gap all round: each corner moves out along its
// bisector, the top and bottom ones sideways by g·h/(L + inset) and the points
// by g·L/h, where h is half the height and L a slanted edge's length.
const ISSUE_RING = (() => {
  const g = RING_GAP;

  const h = NODE_HEIGHT / 2;

  const slant = Math.hypot(INSET, h);

  const side = Num.div(g * h, asNonZeroFiniteNumber(slant + INSET));

  const tip = Num.div(g * slant, asNonZeroFiniteNumber(h));

  return `M${INSET - side},${-g} H${NODE_WIDTH - INSET + side} L${NODE_WIDTH + tip},${h} L${NODE_WIDTH - INSET + side},${NODE_HEIGHT + g} H${INSET - side} L${-tip},${h} Z`;
})();

const R = NODE_HEIGHT / 2;

const ROUNDED =
  `M${R},0 H${NODE_WIDTH - R} A${R},${R} 0 0 1 ${NODE_WIDTH - R},${NODE_HEIGHT} H${R} A${R},${R} 0 0 1 ${R},0 Z` as const;

const ROUNDED_RING =
  `M${R},${-RING_GAP} H${NODE_WIDTH - R} A${R + RING_GAP},${R + RING_GAP} 0 0 1 ${NODE_WIDTH - R},${NODE_HEIGHT + RING_GAP} H${R} A${R + RING_GAP},${R + RING_GAP} 0 0 1 ${R},${-RING_GAP} Z` as const;

/** The baseline of line `index` of `count`, the lines centred in the node. */
const lineY = (index: number, count: number): number =>
  NODE_HEIGHT / 2 + (index - (count - 1) / 2) * LINE_HEIGHT;

/** A pill wide enough for its text in 10px bold figures. */
const pillWidthOf = (text: string): number => 8 + 6.2 * text.length;

/** The tiers and priority drawn with a second outline: start these first. */
const isRinged = (pill: DagNode['pill']): boolean =>
  pill === 'S' || pill === 'A' || pill === 'high';

/** The tiers drawn faint: the ones to start last, if at all. */
const isFaded = (pill: DagNode['pill']): boolean =>
  pill === 'D' || pill === 'hold' || pill === 'close';

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
