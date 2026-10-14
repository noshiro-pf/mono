import { memoNamed } from 'preact-utils';
import { Arr } from 'ts-data-forge';
import { issuesViewSignals } from '../store/index.mjs';
import { IssueDagLegend } from './issue-dag-legend.js';
import { IssueDagNode } from './issue-dag-node.js';

/**
 * The open issues as a graph of what each waits for, read left to right:
 * an arrow runs from what an issue's `Start-After:` names to the issue, and
 * a dashed line from an issue to an open pull request that closes it. Each
 * node is a link to its page on GitHub. Where everything goes is
 * `issue-graph-layout.mts`; this only draws it, in a box that scrolls when
 * the graph is wider or taller than it. In a block that scrolls on its own
 * the box takes what room the block has (`index.css`); elsewhere it is at
 * most 70% of the window's height.
 */
export const IssueDag = memoNamed('IssueDag', () => {
  const graph = issuesViewSignals.graph.value;

  if (!Arr.isNonEmpty(graph.nodes)) {
    return <p className={'section-note'}>{'No open issues.'}</p>;
  }

  const layout = issuesViewSignals.layout.value;

  const byNumber = new Map(graph.nodes.map((node) => [node.number, node]));

  return (
    <div className={'issue-dag'}>
      <IssueDagLegend graph={graph} />

      <div className={'issue-dag-scroll'}>
        <svg
          className={'issue-dag-svg'}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          width={layout.width}
        >
          <title>{'Open issues and what each waits for'}</title>

          <defs>
            <marker
              id={'issue-dag-arrow'}
              markerHeight={8}
              markerUnits={'userSpaceOnUse'}
              markerWidth={8}
              orient={'auto'}
              refX={8}
              refY={4}
              viewBox={'0 0 8 8'}
            >
              <path className={'issue-dag-arrow'} d={'M 0 0 L 8 4 L 0 8 z'} />
            </marker>
          </defs>

          <g className={'issue-dag-edges'}>
            {layout.edges.map((edge) => (
              <path
                key={`${edge.kind}-${edge.from}-${edge.to}`}
                className={'issue-dag-edge'}
                d={edge.path}
                data-kind={edge.kind}
                data-settled={edge.settled}
                markerEnd={
                  edge.kind === 'start-after'
                    ? 'url(#issue-dag-arrow)'
                    : undefined
                }
              />
            ))}
          </g>

          {layout.unconnectedLabel === undefined ? undefined : (
            <text
              className={'issue-dag-group-label'}
              x={layout.unconnectedLabel.x}
              y={layout.unconnectedLabel.y}
            >
              {'No dependencies either way'}
            </text>
          )}

          <g className={'issue-dag-nodes'}>
            {layout.nodes.map(({ number, x, y }) => {
              const node = byNumber.get(number);

              return node === undefined ? undefined : (
                <IssueDagNode key={number} node={node} x={x} y={y} />
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
});
