import { map, type InitializedObservable } from 'synstate';
import { constant, derive, For, If, view, type JSX } from 'synstate-dom';
import { Num } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  PRIORITY_OVERHANG,
} from '../issue-graph-layout.mjs';
import type { IssueGraphNode } from '../issue-graph.mjs';
import { numberPillWidth, wrapTitle } from '../node-title.mjs';
import { describeNode } from './issue-dag-states.mjs';
import { SvgLink } from './svg-elements.js';

/** A node and the top-left corner it is drawn at. */
export type PlacedNode = Readonly<{
  node: IssueGraphNode;
  x: number;
  y: number;
}>;

type Props = Readonly<{ placed$: InitializedObservable<PlacedNode> }>;

/**
 * One issue or pull request: its title, in the colour of where it stands
 * (`index.css`), and a link to it on GitHub. An issue is a box with pointed
 * ends and a pull request a rounded box, so the two read apart before the
 * colour does — the issue angular, as the problem it raises, and the pull
 * request rounded, as what settles it. Its number is on a pill across the left
 * of the top edge, and its `priority:*` label a word on a pill across the
 * right, both in ink rather than a colour, since the shape and the colour
 * already say what it is and where it stands; the number is the quieter of the
 * two, as what identifies a node rather than what ranks it. A high one also
 * gets a second outline around the shape, and a low one is drawn faint, as is
 * one labelled `pending`, held back for now. The number, the state, the
 * priority and whether it is pending are in the tooltip, which is also what a
 * screen reader announces.
 *
 * A row of the DAG keyed by its number, so the number, and with it the kind,
 * the URL and the width of the number's pill, are the ones it was made with;
 * where it stands, its title and its priority follow the graph.
 */
export const IssueDagNode = ({ placed$ }: Props): JSX.Element => {
  const { number, kind, url } = placed$.getSnapshot().value.node;

  const numberWidth = numberPillWidth(number);

  const lines$ = placed$.pipe(map(({ node }) => linesOf(node)));

  return (
    <SvgLink href={url} title={view(placed$, ({ node }) => describeNode(node))}>
      <g
        class={constant('issue-dag-node')}
        data-kind={constant(kind)}
        data-pending={view(placed$, ({ node }) => node.pending.toString())}
        data-priority={view(placed$, ({ node }) => node.priority)}
        data-state={view(placed$, ({ node }) => node.state)}
        transform={view(placed$, ({ x, y }) => `translate(${x} ${y})`)}
      >
        <If
          cond={view(placed$, ({ node }) => node.priority === 'high')}
          then={
            kind === 'pull-request' ? (
              <rect
                class={constant('issue-dag-ring')}
                height={constant(NODE_HEIGHT + 2 * RING_GAP)}
                rx={constant(NODE_HEIGHT / 2 + RING_GAP)}
                width={constant(NODE_WIDTH + 2 * RING_GAP)}
                x={constant(-RING_GAP)}
                y={constant(-RING_GAP)}
              />
            ) : (
              <polygon
                class={constant('issue-dag-ring')}
                points={constant(ISSUE_RING)}
              />
            )
          }
        />
        {kind === 'pull-request' ? (
          <rect
            class={constant('issue-dag-shape')}
            height={constant(NODE_HEIGHT)}
            rx={constant(NODE_HEIGHT / 2)}
            width={constant(NODE_WIDTH)}
          />
        ) : (
          <polygon
            class={constant('issue-dag-shape')}
            points={constant(ISSUE_SHAPE)}
          />
        )}
        <text
          class={constant('issue-dag-title')}
          text-anchor={constant('middle')}
        >
          {/* The lines of one title, which only ever change together. */}
          <For items={lines$} key={(_, index) => index}>
            {(line$, index$) => (
              <tspan
                dominant-baseline={constant('central')}
                x={constant(NODE_WIDTH / 2)}
                y={derive(
                  [index$, lines$],
                  (index, lines) =>
                    NODE_HEIGHT / 2 +
                    (index - (lines.length - 1) / 2) * LINE_HEIGHT,
                )}
              >
                {line$}
              </tspan>
            )}
          </For>
        </text>
        <g
          class={constant('issue-dag-number')}
          transform={constant(`translate(${NUMBER_X} ${-PRIORITY_HEIGHT / 2})`)}
        >
          <rect
            height={constant(PRIORITY_HEIGHT)}
            rx={constant(PRIORITY_HEIGHT / 2)}
            width={constant(numberWidth)}
          />
          <text
            dominant-baseline={constant('central')}
            text-anchor={constant('middle')}
            x={constant(numberWidth / 2)}
            y={constant(PRIORITY_HEIGHT / 2)}
          >
            {constant(`#${number}`)}
          </text>
        </g>
        <If
          cond={view(placed$, ({ node }) => node.priority !== 'none')}
          then={
            <g
              class={constant('issue-dag-priority')}
              data-priority={view(placed$, ({ node }) => node.priority)}
              transform={constant(
                `translate(${PRIORITY_X} ${-PRIORITY_HEIGHT / 2})`,
              )}
            >
              <rect
                height={constant(PRIORITY_HEIGHT)}
                rx={constant(PRIORITY_HEIGHT / 2)}
                width={constant(PRIORITY_WIDTH)}
              />
              <text
                dominant-baseline={constant('central')}
                text-anchor={constant('middle')}
                x={constant(PRIORITY_WIDTH / 2)}
                y={constant(PRIORITY_HEIGHT / 2)}
              >
                {view(placed$, ({ node }) => node.priority)}
              </text>
            </g>
          }
        />
      </g>
    </SvgLink>
  );
};

const linesOf = (node: IssueGraphNode): readonly string[] =>
  wrapTitle(
    node.title === '' ? `#${node.number}` : node.title,
    TITLE_UNITS,
    TITLE_LINES,
  );

/** How far an issue's pointed ends reach in. */
const POINT_INSET = 12;

/** Clockwise on the page, from the top-left corner. */
const ISSUE_POINTS = [
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

const ISSUE_SHAPE = toPoints(ISSUE_POINTS);

const ISSUE_RING = toPoints(offsetPolygon(ISSUE_POINTS, RING_GAP));

/** What a line of 12px text holds inside the pointed ends, in narrow characters. */
const TITLE_UNITS = 26;

const TITLE_LINES = 2;

const LINE_HEIGHT = 15;

/** Wide enough for `high` in 10px bold. */
const PRIORITY_WIDTH = 36;

/** Centred on the top edge. */
const PRIORITY_HEIGHT = 2 * PRIORITY_OVERHANG;

/** Where the straight part of the top edge starts, for either shape. */
const NUMBER_X = NODE_HEIGHT / 2;

/** Inside the straight part of the top edge, for either shape. */
const PRIORITY_X = NODE_WIDTH - NODE_HEIGHT / 2 - PRIORITY_WIDTH;
