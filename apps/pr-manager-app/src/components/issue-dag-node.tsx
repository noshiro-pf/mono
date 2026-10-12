import { memoNamed } from 'preact-utils';
import { useMemo } from 'preact/hooks';
import { Num } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  PRIORITY_OVERHANG,
} from '../issue-graph-layout.mjs';
import type { IssueGraphNode } from '../issue-graph.mjs';
import { wrapTitle } from '../node-title.mjs';
import { ExternalLink } from './external-link.js';
import { describeNode } from './issue-dag-states.mjs';

type Props = Readonly<{
  node: IssueGraphNode;
  /** The top-left corner. */
  x: number;
  y: number;
}>;

/**
 * One issue or pull request: its title, in the colour of where it stands
 * (`index.css`), and a link to it on GitHub. An issue is a rounded box and a
 * pull request a box with pointed ends, so the two read apart before the
 * colour does. Its `priority:*` label is a word on a pill across the top
 * edge, in ink rather than a colour, since the shape and the colour already
 * say what it is and where it stands; a high one also gets a second outline
 * around the shape, and a low one is drawn faint. The number, the state and
 * the priority are in the tooltip, which is also what a screen reader
 * announces.
 */
export const IssueDagNode = memoNamed<Props>(
  'IssueDagNode',
  ({ node, x, y }) => {
    const lines = useMemo(
      () =>
        wrapTitle(
          node.title === '' ? `#${node.number}` : node.title,
          TITLE_UNITS,
          TITLE_LINES,
        ),
      [node.title, node.number],
    );

    const description = describeNode(node);

    return (
      <ExternalLink
        href={node.url}
        title={description}
        variant={'issue-dag-link'}
      >
        <g
          className={'issue-dag-node'}
          data-kind={node.kind}
          data-priority={node.priority}
          data-state={node.state}
          transform={`translate(${x} ${y})`}
        >
          {node.priority !== 'high' ? undefined : node.kind === 'issue' ? (
            <rect
              className={'issue-dag-ring'}
              height={NODE_HEIGHT + 2 * RING_GAP}
              rx={NODE_HEIGHT / 2 + RING_GAP}
              width={NODE_WIDTH + 2 * RING_GAP}
              x={-RING_GAP}
              y={-RING_GAP}
            />
          ) : (
            <polygon className={'issue-dag-ring'} points={PULL_REQUEST_RING} />
          )}
          {node.kind === 'issue' ? (
            <rect
              className={'issue-dag-shape'}
              height={NODE_HEIGHT}
              rx={NODE_HEIGHT / 2}
              width={NODE_WIDTH}
            />
          ) : (
            <polygon
              className={'issue-dag-shape'}
              points={PULL_REQUEST_SHAPE}
            />
          )}
          <text className={'issue-dag-title'} textAnchor={'middle'}>
            {lines.map((line, index) => (
              <tspan
                // The lines of one title, which only ever change together.
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                dominantBaseline={'central'}
                x={NODE_WIDTH / 2}
                y={
                  NODE_HEIGHT / 2 +
                  (index - (lines.length - 1) / 2) * LINE_HEIGHT
                }
              >
                {line}
              </tspan>
            ))}
          </text>
          {node.priority === 'none' ? undefined : (
            <g
              className={'issue-dag-priority'}
              data-priority={node.priority}
              transform={`translate(${PRIORITY_X} ${-PRIORITY_HEIGHT / 2})`}
            >
              <rect
                height={PRIORITY_HEIGHT}
                rx={PRIORITY_HEIGHT / 2}
                width={PRIORITY_WIDTH}
              />
              <text
                dominantBaseline={'central'}
                textAnchor={'middle'}
                x={PRIORITY_WIDTH / 2}
                y={PRIORITY_HEIGHT / 2}
              >
                {node.priority}
              </text>
            </g>
          )}
        </g>
      </ExternalLink>
    );
  },
);

/** How far a pull request's pointed ends reach in. */
const POINT_INSET = 12;

/** Clockwise on the page, from the top-left corner. */
const PULL_REQUEST_POINTS = [
  [POINT_INSET, 0],
  [NODE_WIDTH - POINT_INSET, 0],
  [NODE_WIDTH, NODE_HEIGHT / 2],
  [NODE_WIDTH - POINT_INSET, NODE_HEIGHT],
  [POINT_INSET, NODE_HEIGHT],
  [0, NODE_HEIGHT / 2],
] as const satisfies readonly FixedLengthTuple<2, number>[];

/** Between a high priority node's shape and its second outline. */
const RING_GAP = 4;

const toPoints = (points: readonly FixedLengthTuple<2, number>[]): string =>
  points.map(([px, py]) => `${px},${py}`).join(' ');

/**
 * The convex polygon `points`, clockwise on the page, with every edge moved
 * `distance` outwards: each corner goes along the bisector of its two edges'
 * normals, as far as keeps both edges `distance` away.
 */
const offsetPolygon = (
  points: readonly FixedLengthTuple<2, number>[],
  distance: number,
): readonly FixedLengthTuple<2, number>[] => {
  // The outward normal of the edge from `a` to `b`: with y pointing down, a
  // clockwise edge has its outside on its left.
  const normal = (
    [ax, ay]: FixedLengthTuple<2, number>,
    [bx, by]: FixedLengthTuple<2, number>,
  ): FixedLengthTuple<2, number> => {
    const edgeLength = Math.hypot(bx - ax, by - ay);

    return Num.isNonZero(edgeLength)
      ? [Num.div(by - ay, edgeLength), Num.div(ax - bx, edgeLength)]
      : [0, 0];
  };

  return points.map((point, index) => {
    const before = points[(index + points.length - 1) % points.length];

    const after = points[(index + 1) % points.length];

    if (before === undefined || after === undefined) {
      return point;
    }

    const [n1x, n1y] = normal(before, point);

    const [n2x, n2y] = normal(point, after);

    // Zero only where the outline turns straight back on itself.
    const bend = 1 + n1x * n2x + n1y * n2y;

    if (!Num.isNonZero(bend)) {
      return point;
    }

    const scale = Num.div(distance, bend);

    return [point[0] + (n1x + n2x) * scale, point[1] + (n1y + n2y) * scale];
  });
};

const PULL_REQUEST_SHAPE = toPoints(PULL_REQUEST_POINTS);

const PULL_REQUEST_RING = toPoints(
  offsetPolygon(PULL_REQUEST_POINTS, RING_GAP),
);

/** What a line of 12px text holds inside the pointed ends, in narrow characters. */
const TITLE_UNITS = 26;

const TITLE_LINES = 2;

const LINE_HEIGHT = 15;

/** Wide enough for `high` in 10px bold. */
const PRIORITY_WIDTH = 36;

/** Centred on the top edge. */
const PRIORITY_HEIGHT = 2 * PRIORITY_OVERHANG;

/** Inside the straight part of the top edge, for either shape. */
const PRIORITY_X = NODE_WIDTH - NODE_HEIGHT / 2 - PRIORITY_WIDTH;
