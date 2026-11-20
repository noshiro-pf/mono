/**
 * Which stacks in the merge order are folded (`stack-fold.mts`).
 *
 * Held for the life of the tab only: everything starts unfolded, which is what
 * the page has always drawn.
 */

import type { TreeNode } from 'pr-report-core';
import {
  createState,
  derive,
  skipIfNoChange,
  type InitializedObservable,
} from 'synstate';
import { fastDeepEqual, Optional } from 'ts-data-forge';
import { foldableNumbersOf, toggleFolded } from '../stack-fold.mjs';

export type StackFoldDeps = Readonly<{
  /** The tree the merge order draws, for "fold all". */
  roots: InitializedObservable<readonly TreeNode[]>;
  /** What the merge order draws a card for: those it has an entry for. */
  byNumber: InitializedObservable<ReadonlyMap<number, unknown>>;
}>;

export type StackFoldStore = Readonly<{
  /** The numbers folded, ascending. */
  folded: InitializedObservable<readonly number[]>;
  /** What "fold all" folds (`foldableNumbersOf`), ascending. */
  foldable: InitializedObservable<readonly number[]>;
  toggle: (number: number) => void;
  foldAll: () => void;
  unfoldAll: () => void;
}>;

export const createStackFoldStore = (deps: StackFoldDeps): StackFoldStore => {
  const [folded, setFolded, { updateState }] = createState<readonly number[]>(
    [],
  );

  const foldable = derive([deps.roots, deps.byNumber], (roots, byNumber) =>
    foldableNumbersOf(roots, (number) => byNumber.has(number)).toSorted(
      (a, b) => a - b,
    ),
  ).pipe(skipIfNoChange(fastDeepEqual));

  return {
    folded,
    foldable,
    toggle: (number) => {
      updateState((current) => toggleFolded(current, number));
    },
    foldAll: () => {
      setFolded(Optional.unwrap(foldable.getSnapshot()));
    },
    unfoldAll: () => {
      setFolded([]);
    },
  };
};
