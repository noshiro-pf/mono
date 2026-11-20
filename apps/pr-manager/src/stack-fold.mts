/**
 * Folding a stack in the merge order: what is below a pull request in the tree
 * is drawn in place as one thing, so that a stack thirty layers deep takes the
 * room of its first card and what follows it is in view.
 *
 * A pull request is folded by its number, so a fold outlives a poll that
 * rebuilt the tree, and one whose pull request has gone simply never matches
 * again. A pull request drawn twice (`TreeNode.repeated`) is expanded under its
 * first predecessor only, and so counts there only.
 */
import type { ChecksSummary, TreeNode } from 'pr-report-core';
import { Arr } from 'ts-data-forge';

/**
 * The pull requests below `node` that the merge order would draw, nearest
 * first, each once. One drawn in full under another predecessor is left out,
 * since it is not folded away here, and so is one `isDrawn` says is not drawn,
 * with everything below it, as the merge order leaves out a pull request it has
 * no entry for.
 */
export const layersBelow = (
  node: TreeNode,
  isDrawn: (number: number) => boolean,
): readonly number[] => {
  const mut_seen = new Set<number>();

  const walk = (children: readonly TreeNode[]): readonly number[] =>
    children.flatMap((child) => {
      if (
        child.repeated ||
        mut_seen.has(child.number) ||
        !isDrawn(child.number)
      ) {
        return [];
      }

      mut_seen.add(child.number);

      return Arr.toUnshifted(child.number)(walk(child.children));
    });

  return walk(node.children);
};

/**
 * The pull requests "fold all" folds: in each branch of the tree, the first one
 * that has something below it. What is below it is folded with it, so unfolding
 * it shows the whole stack rather than one more layer of it.
 */
export const foldableNumbersOf = (
  roots: readonly TreeNode[],
  isDrawn: (number: number) => boolean,
): readonly number[] => {
  const mut_found = new Set<number>();

  const walk = (nodes: readonly TreeNode[]): void => {
    for (const each of nodes) {
      if (each.repeated) {
        continue;
      }

      if (!isDrawn(each.number)) {
        continue;
      }

      if (Arr.isNonEmpty(layersBelow(each, isDrawn))) {
        mut_found.add(each.number);
      } else {
        walk(each.children);
      }
    }
  };

  walk(roots);

  return Array.from(mut_found);
};

/** Folds `number` when it is not, and unfolds it when it is. */
export const toggleFolded = (
  folded: readonly number[],
  number: number,
): readonly number[] =>
  folded.includes(number)
    ? folded.filter((each) => each !== number)
    : Arr.toPushed(folded, number).toSorted((a, b) => a - b);

export type LayerState = Readonly<{
  /**
   * The verdict of its checks, or why there is none: `reading` while they are
   * still being read, `unread` when they were read but not judged
   * (`Entry.checksUnread`), whose verdict is a stand-in the page never shows.
   */
  checks: ChecksSummary['verdict'] | 'reading' | 'unread';
  isDraft: boolean;
}>;

export type LayerTally = Readonly<{
  total: number;
  passed: number;
  failing: number;
  pending: number;
  paused: number;
  reading: number;
  unread: number;
  drafts: number;
}>;

/**
 * What a folded stack says of the layers in it: how many are in each verdict,
 * how many have none yet, and how many are drafts besides.
 */
export const tallyLayers = (states: readonly LayerState[]): LayerTally => {
  const count = (checks: LayerState['checks']): number =>
    states.filter((state) => state.checks === checks).length;

  return {
    total: states.length,
    passed: count('passed'),
    failing: count('failing'),
    pending: count('pending'),
    paused: count('paused'),
    reading: count('reading'),
    unread: count('unread'),
    drafts: states.filter(({ isDraft }) => isDraft).length,
  };
};
