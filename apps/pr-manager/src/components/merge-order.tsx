import type { TreeNode } from 'pr-report-core';
import {
  constant,
  derive,
  For,
  If,
  mapBindable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import type { Entry } from '../load-report.mjs';
import { reader } from '../store/index.mjs';
import { ExternalLink } from './external-link.js';
import { PullRequestCard } from './pull-request-card.js';

type Props = Readonly<{
  nodes: Bindable<readonly TreeNode[]>;
  /** Only the top level is the list; everything below it is a continuation. */
  depth: number;
}>;

/**
 * The order the `Merge-After:` trailers declare, drawn as the tree it is.
 *
 * A table would have to spell the tree back out in a column and leave the
 * reader to rebuild it; nested, the one at the top is the one to look at.
 *
 * Each level keeps one row per pull request, by number, so a poll moves the
 * cards that moved and rewrites the ones that changed, and builds only the
 * ones that are new.
 */
export const MergeOrder = ({ nodes, depth }: Props): JSX.Element => {
  const rows = derive([nodes, reader.byNumber], rowsOf());

  return (
    <ul
      class={constant(depth === 0 ? 'merge-order' : 'merge-order-children')}
      // How deep the tree goes, so that each level's indent can be cut to leave
      // the deepest card room; see `.merge-order-children`.
      style={
        depth === 0
          ? {
              '--merge-order-depth': mapBindable(nodes, (top) =>
                depthOf(top).toString(),
              ),
            }
          : undefined
      }
    >
      <For items={rows} key={rowKey}>
        {(row$) => (
          <li>
            <If
              cond={view(row$, ({ node }) => node.repeated)}
              // Declared after more than one predecessor, so it is drawn under
              // each and expanded under the first only.
              then={
                <div class={constant('pull-request-repeated')}>
                  <ExternalLink href={view(row$, ({ entry }) => entry.url)}>
                    {view(row$, ({ node }) => `#${node.number}`)}
                  </ExternalLink>
                  {constant(' — shown above')}
                </div>
              }
              else={
                <PullRequestCard
                  entry={view(row$, ({ entry }) => entry)}
                  scaleMax={reader.scaleMax}
                />
              }
            />

            <If
              cond={view(row$, ({ node }) => Arr.isNonEmpty(node.children))}
              then={
                <MergeOrder
                  depth={depth + 1}
                  nodes={view(row$, ({ node }) => node.children)}
                />
              }
            />
          </li>
        )}
      </For>
    </ul>
  );
};

type Row = Readonly<{ node: TreeNode; entry: Entry }>;

/**
 * The nodes there is an entry for, each with its entry. A row whose node and
 * entry are both the ones it had is the same object, so that a poll that
 * changed one pull request updates one row rather than every row's bindings.
 */
const rowsOf = (): ((
  nodes: readonly TreeNode[],
  byNumber: ReadonlyMap<number, Entry>,
) => readonly Row[]) => {
  const mut_previous = new Map<number, Row>();

  return (nodes, byNumber) => {
    const rows = nodes.flatMap((node) => {
      const entry = byNumber.get(node.number);

      if (entry === undefined) {
        return [];
      }

      const previous = mut_previous.get(node.number);

      return [
        previous?.node === node && previous.entry === entry
          ? previous
          : { node, entry },
      ];
    });

    mut_previous.clear();

    for (const row of rows) {
      mut_previous.set(row.node.number, row);
    }

    return rows;
  };
};

const rowKey = ({ node }: Row): number => node.number;

/** How many levels the tree has below its top one. */
const depthOf = (nodes: readonly TreeNode[]): number =>
  nodes.reduce(
    (max, node) =>
      Arr.isNonEmpty(node.children)
        ? Math.max(max, 1 + depthOf(node.children))
        : max,
    0,
  );
