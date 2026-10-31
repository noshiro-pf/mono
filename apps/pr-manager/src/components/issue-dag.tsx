import {
  constant,
  derive,
  For,
  If,
  MatchOptional,
  view,
  type JSX,
} from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import type { IssueGraphLayout, LaidOutEdge } from '../issue-graph-layout.mjs';
import type { IssueGraph } from '../issue-graph.mjs';
import { issuesListStore, issuesViewStore, reader } from '../store/index.mjs';
import { dagBox } from './dag-box.mjs';
import { IssueDagLegend } from './issue-dag-legend.js';
import { IssueDagNode, type PlacedNode } from './issue-dag-node.js';
import { SvgTitle } from './svg-elements.js';

/**
 * The open issues as a graph of what each waits for, read left to right:
 * an arrow runs from what an issue's `Start-After:` names to the issue, and
 * a dashed line from an issue to an open pull request that closes it. Each
 * node is a link to its page on GitHub. Where everything goes is
 * `issue-graph-layout.mts`; this only draws it, in a box that scrolls when
 * the graph is wider or taller than it. In a block that scrolls on its own
 * the box takes what room the block has (`index.css`); elsewhere it is at
 * most 70% of the window's height.
 *
 * Drawn at the scale the zoom above it chose (`issue-dag-zoom.tsx`): the
 * `viewBox` stays the layout's, and the size the SVG takes on the page is
 * what is scaled, so that the box scrolls over the graph at any size.
 * Rounded down to whole pixels, which a fit relies on to leave the box no
 * scroll bar to draw.
 */
export const IssueDag = (): JSX.Element => (
  <If
    cond={view(issuesViewStore.graph, ({ nodes }) => Arr.isNonEmpty(nodes))}
    then={<Dag />}
    else={
      <p class={constant('section-note')}>
        {derive(
          [reader.issues, issuesListStore.filter, issuesViewStore.counts],
          ({ items }, { hidePending }, { open, pending }) =>
            Arr.isEmpty(items)
              ? 'No open issues.'
              : hidePending && pending.total === open.total
                ? 'Every open issue is pending.'
                : 'No open issue has the priorities and pending shown.',
        )}
      </p>
    }
  />
);

const edgeKey = ({ kind, from, to }: LaidOutEdge): string =>
  `${kind}-${from}-${to}` as const;

/** Each node the layout places, with where it goes. */
const placedNodesOf = (
  layout: IssueGraphLayout,
  graph: IssueGraph,
): readonly PlacedNode[] => {
  const byNumber = new Map(graph.nodes.map((node) => [node.number, node]));

  return Arr.generate(function* () {
    for (const { number, x, y } of layout.nodes) {
      const node = byNumber.get(number);

      if (node !== undefined) {
        yield { node, x, y };
      }
    }
  });
};

const Dag = (): JSX.Element => {
  const { graph: graph$, dagScale: scale$, layout: layout$ } = issuesViewStore;

  const box = dagBox(scale$, layout$);

  return (
    <div class={constant('issue-dag')}>
      <IssueDagLegend />

      <div
        ref={box.ref}
        class={constant('issue-dag-scroll')}
        onScroll={box.onScroll}
      >
        <svg
          class={constant('issue-dag-svg')}
          height={derive([layout$, scale$], (layout, scale) =>
            Math.floor(layout.height * scale),
          )}
          viewBox={view(
            layout$,
            ({ width, height }) => `0 0 ${width} ${height}`,
          )}
          width={derive([layout$, scale$], (layout, scale) =>
            Math.floor(layout.width * scale),
          )}
        >
          <SvgTitle>{constant('Open issues and what each waits for')}</SvgTitle>

          <defs>
            <marker
              id={constant('issue-dag-arrow')}
              markerHeight={constant(8)}
              markerUnits={constant('userSpaceOnUse')}
              markerWidth={constant(8)}
              orient={constant('auto')}
              refX={constant(8)}
              refY={constant(4)}
              viewBox={constant('0 0 8 8')}
            >
              <path
                class={constant('issue-dag-arrow')}
                d={constant('M 0 0 L 8 4 L 0 8 z')}
              />
            </marker>
          </defs>

          <g class={constant('issue-dag-edges')}>
            <For items={view(layout$, ({ edges }) => edges)} key={edgeKey}>
              {(edge$) => (
                <path
                  class={constant('issue-dag-edge')}
                  d={view(edge$, ({ path }) => path)}
                  data-kind={view(edge$, ({ kind }) => kind)}
                  // The kind is in the key, so it is the one the row was
                  // made with.
                  marker-end={
                    edge$.getSnapshot().value.kind === 'start-after'
                      ? constant('url(#issue-dag-arrow)')
                      : undefined
                  }
                />
              )}
            </For>
          </g>

          <MatchOptional
            value={view(layout$, ({ unconnectedLabel }) =>
              Optional.fromNullable(unconnectedLabel),
            )}
            some={(at$) => (
              <text
                class={constant('issue-dag-group-label')}
                x={view(at$, ({ x }) => x)}
                y={view(at$, ({ y }) => y)}
              >
                {constant('No dependencies drawn either way')}
              </text>
            )}
          />

          <g class={constant('issue-dag-nodes')}>
            <For
              items={derive([layout$, graph$], placedNodesOf)}
              key={({ node }) => node.number}
            >
              {(placed$) => <IssueDagNode placed$={placed$} />}
            </For>
          </g>
        </svg>
      </div>
    </div>
  );
};
