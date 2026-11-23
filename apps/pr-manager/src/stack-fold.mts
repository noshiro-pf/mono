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
import { Arr, isRecord } from 'ts-data-forge';

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

/**
 * The pull request `number` and the layers below it ({@link layersBelow}), as
 * the merge order draws them: below its first place in the tree, not one where
 * it is only named (`TreeNode.repeated`). Just `number` when the tree has no
 * such place.
 */
export const stackNumbersOf = (
  roots: readonly TreeNode[],
  number: number,
  isDrawn: (each: number) => boolean,
): readonly number[] => {
  const find = (nodes: readonly TreeNode[]): TreeNode | undefined => {
    for (const each of nodes) {
      if (each.repeated) {
        continue;
      }

      if (each.number === number) {
        return each;
      }

      const found = find(each.children);

      if (found !== undefined) {
        return found;
      }
    }

    return undefined;
  };

  const node = find(roots);

  return node === undefined
    ? [number]
    : Arr.toUnshifted(number)(layersBelow(node, isDrawn));
};

/**
 * The pull requests folded, ascending: those the reader chose to fold, and,
 * when stacks start folded, every one "fold all" would fold
 * ({@link foldableNumbersOf}) that the reader has not chosen to unfold.
 */
export const foldedNumbersOf = (
  choices: readonly FoldChoice[],
  {
    foldable,
    foldByDefault,
  }: Readonly<{ foldable: readonly number[]; foldByDefault: boolean }>,
): readonly number[] => {
  const chosen = new Set<number>(choices.map(({ number }) => number));

  const byDefault = foldByDefault
    ? foldable.filter((number) => !chosen.has(number))
    : ([] as const);

  return Arr.uniq([
    ...choices.filter(({ folded }) => folded).map(({ number }) => number),
    ...byDefault,
  ]).toSorted((a, b) => a - b);
};

/**
 * The choices with each of `numbers` folded or unfolded as the latest of them,
 * in place of any earlier choice for it, and only the latest
 * {@link MAX_FOLD_CHOICES} kept. `numbers` are added last first, so that the
 * first of them is the last to go.
 */
export const withFoldChoices = (
  choices: readonly FoldChoice[],
  numbers: readonly number[],
  folded: boolean,
): readonly FoldChoice[] =>
  latestOnly([
    ...choices,
    ...numbers.toReversed().map((number) => ({ number, folded }) as const),
  ]);

/**
 * The choices in what was saved, as it was saved. Anything that is not one is
 * dropped, and anything but a list is none: a browser's storage can hold what
 * an older or a newer page wrote.
 */
export const foldChoicesFrom = (saved: unknown): readonly FoldChoice[] =>
  Arr.isArray(saved) ? latestOnly(saved.filter(isFoldChoice)) : ([] as const);

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

/**
 * A pull request folded or unfolded by the reader, by its number. A press
 * chooses for the pull request pressed and for every layer below it, so that
 * when the stack's first layer merges, the one now first keeps the choice.
 * Kept across reloads (`stack-fold-store.mts`).
 */
export type FoldChoice = Readonly<{ number: number; folded: boolean }>;

/**
 * How many choices are kept, the latest. A pull request that merged or closed
 * is never drawn again, so its choice only takes room; this bounds that room
 * without having to know which pull requests are gone, which a page still
 * reading cannot tell. Room for a few dozen stacks of a few dozen layers.
 */
export const MAX_FOLD_CHOICES = 1000;

/**
 * Each number's latest choice, in the order of those, and the latest
 * {@link MAX_FOLD_CHOICES} of them.
 */
const latestOnly = (choices: readonly FoldChoice[]): readonly FoldChoice[] => {
  const mut_latest = new Map<number, FoldChoice>();

  for (const choice of choices) {
    mut_latest.delete(choice.number);

    mut_latest.set(choice.number, choice);
  }

  return Array.from(mut_latest.values()).slice(-MAX_FOLD_CHOICES);
};

const isFoldChoice = (value: unknown): value is FoldChoice =>
  isRecord(value) &&
  typeof value['number'] === 'number' &&
  Number.isSafeInteger(value['number']) &&
  value['number'] > 0 &&
  typeof value['folded'] === 'boolean';
