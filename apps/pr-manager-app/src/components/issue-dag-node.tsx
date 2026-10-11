import { memoNamed } from 'preact-utils';
import { useMemo } from 'preact/hooks';
import { NODE_HEIGHT, NODE_WIDTH } from '../issue-graph-layout.mjs';
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
 * colour does. The number and the state are in the tooltip, which is also
 * what a screen reader announces.
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
          data-state={node.state}
          transform={`translate(${x} ${y})`}
        >
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
        </g>
      </ExternalLink>
    );
  },
);

/** How far a pull request's pointed ends reach in. */
const POINT_INSET = 12;

const PULL_REQUEST_SHAPE = [
  [POINT_INSET, 0],
  [NODE_WIDTH - POINT_INSET, 0],
  [NODE_WIDTH, NODE_HEIGHT / 2],
  [NODE_WIDTH - POINT_INSET, NODE_HEIGHT],
  [POINT_INSET, NODE_HEIGHT],
  [0, NODE_HEIGHT / 2],
]
  .map(([px, py]) => `${px},${py}`)
  .join(' ');

/** What a line of 12px text holds inside the pointed ends, in narrow characters. */
const TITLE_UNITS = 26;

const TITLE_LINES = 2;

const LINE_HEIGHT = 15;
