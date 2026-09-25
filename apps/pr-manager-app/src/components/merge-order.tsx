import { type TreeNode } from 'pr-report-core';
import * as React from 'react';
import { Arr } from 'ts-data-forge';
import { type Entry } from '../load-report.mjs';
import { ExternalLink } from './external-link.js';
import { PullRequestCard } from './pull-request-card.js';

type Props = Readonly<{
  nodes: readonly TreeNode[];
  byNumber: ReadonlyMap<number, Entry>;
  /** The scale every divergence bar in the report is drawn against. */
  scaleMax: number;
  /** The instant every age in the tree is measured against. */
  nowMs: number;
  /** Only the top level is the list; everything below it is a continuation. */
  depth?: number;
}>;

/**
 * The order the `Merge-After:` trailers declare, drawn as the tree it is.
 *
 * A table would have to spell the tree back out in a column and leave the
 * reader to rebuild it; nested, the one at the top is the one to look at.
 */
export const MergeOrder = React.memo<Props>(
  ({ nodes, byNumber, scaleMax, nowMs, depth = 0 }) => (
    <ul className={depth === 0 ? 'merge-order' : 'merge-order-children'}>
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
              <PullRequestCard
                entry={entry}
                nowMs={nowMs}
                scaleMax={scaleMax}
              />
            )}

            {Arr.isNonEmpty(node.children) ? (
              <MergeOrder
                byNumber={byNumber}
                depth={depth + 1}
                nodes={node.children}
                nowMs={nowMs}
                scaleMax={scaleMax}
              />
            ) : undefined}
          </li>
        );
      })}
    </ul>
  ),
);

MergeOrder.displayName = 'MergeOrder';
