import type { TreeNode } from 'pr-report-core';
import { memoNamed } from 'preact-utils';
import { useMemo } from 'preact/hooks';
import { Arr } from 'ts-data-forge';
import type { Entry } from '../load-report.mjs';
import { ExternalLink } from './external-link.js';
import { PullRequestCard } from './pull-request-card.js';

type Props = Readonly<{
  nodes: readonly TreeNode[];
  byNumber: ReadonlyMap<number, Entry>;
  /** The scale every divergence bar in the report is drawn against. */
  scaleMax: number;
  /** Only the top level is the list; everything below it is a continuation. */
  depth?: number;
}>;

/**
 * The order the `Merge-After:` trailers declare, drawn as the tree it is.
 *
 * A table would have to spell the tree back out in a column and leave the
 * reader to rebuild it; nested, the one at the top is the one to look at.
 */
export const MergeOrder = memoNamed<Props>(
  'MergeOrder',
  ({ nodes, byNumber, scaleMax, depth = 0 }) => {
    // How deep the tree goes, so that each level's indent can be cut to leave
    // the deepest card room; see `.merge-order-children`.
    const style = useMemo(
      () =>
        depth === 0
          ? { '--merge-order-depth': String(depthOf(nodes)) }
          : undefined,
      [depth, nodes],
    );

    return (
      <ul
        className={depth === 0 ? 'merge-order' : 'merge-order-children'}
        style={style}
      >
        {nodes.map((node) => {
          const entry = byNumber.get(node.number);

          return entry === undefined ? undefined : (
            <li key={node.number}>
              {node.repeated ? (
                // Declared after more than one predecessor, so it is drawn under
                // each and expanded under the first only.
                <div className={'pull-request-repeated'}>
                  <ExternalLink
                    href={entry.url}
                  >{`#${node.number}`}</ExternalLink>
                  {' — shown above'}
                </div>
              ) : (
                <PullRequestCard entry={entry} scaleMax={scaleMax} />
              )}

              {Arr.isNonEmpty(node.children) ? (
                <MergeOrder
                  byNumber={byNumber}
                  depth={depth + 1}
                  nodes={node.children}
                  scaleMax={scaleMax}
                />
              ) : undefined}
            </li>
          );
        })}
      </ul>
    );
  },
);

/** How many levels the tree has below its top one. */
const depthOf = (nodes: readonly TreeNode[]): number =>
  nodes.reduce(
    (max, node) =>
      Arr.isNonEmpty(node.children)
        ? Math.max(max, 1 + depthOf(node.children))
        : max,
    0,
  );
