/**
 * Which stacks in the merge order are folded (`stack-fold.mts`).
 *
 * **Whether stacks start folded** is the Layout dialog's `foldStacks`
 * (`layout.mts`), kept in the URL with the rest of the layout. Folded, every
 * pull request "fold all" would fold is folded until the reader unfolds it, a
 * stack that appears later included.
 *
 * **What the reader folds or unfolds** is kept as choices by number
 * (`FoldChoice`), which win over that default, in IndexedDB (`settings-db.mts`)
 * under the repository's own key: how much of a stack this reader wants to see
 * is not a way of looking at the page worth sharing in a link, and a list of
 * numbers that grows with every press would make the URL longer every time. So
 * a reload, or a link opened later, folds what was folded. "fold all" and
 * "unfold all" replace the choices, and so does changing the default in the
 * Layout dialog: the page then looks the way that was asked for, rather than
 * keeping exceptions made under the other one. A link or a bookmark that says
 * otherwise, or "Reset the layout", is how the page is opened or laid out, not
 * that choice, and keeps them.
 *
 * **Each change is saved as a change** (`update`), applied to what is stored at
 * the time rather than written over it, so two tabs on one repository each keep
 * what the other saved, and a tab that could not read what was saved still
 * loses nothing by saving. Changes made before `load` answers are laid over
 * what it read, in order.
 */

import type { TreeNode } from 'pr-report-core';
import {
  createState,
  derive,
  skipIfNoChange,
  type InitializedObservable,
} from 'synstate';
import { Arr, fastDeepEqual, Optional } from 'ts-data-forge';
import {
  foldableNumbersOf,
  foldChoicesFrom,
  foldedNumbersOf,
  stackNumbersOf,
  withFoldChoices,
  type FoldChoice,
} from '../stack-fold.mjs';

export type StackFoldDeps = Readonly<{
  /** The tree the merge order draws, for "fold all". */
  roots: InitializedObservable<readonly TreeNode[]>;
  /** What the merge order draws a card for: those it has an entry for. */
  byNumber: InitializedObservable<ReadonlyMap<number, unknown>>;
  /** Whether stacks start folded: the layout's `foldStacks`. */
  foldByDefault: InitializedObservable<boolean>;
  /** The choices saved, as they were saved; it rejects when none can be read. */
  load: () => Promise<unknown>;
  /**
   * Replaces the choices saved with what `change` makes of them, read as
   * `foldChoicesFrom` reads them.
   */
  update: (
    change: (saved: readonly FoldChoice[]) => readonly FoldChoice[],
  ) => void;
}>;

export type StackFoldStore = Readonly<{
  /** The numbers folded, ascending. */
  folded: InitializedObservable<readonly number[]>;
  /** What "fold all" folds (`foldableNumbersOf`), ascending. */
  foldable: InitializedObservable<readonly number[]>;
  /** Folds or unfolds the pull request and every layer below it. */
  toggle: (number: number) => void;
  foldAll: () => void;
  unfoldAll: () => void;
  /**
   * Forgets every choice, for a change of whether stacks start folded made in
   * the Layout dialog: the page then looks the way that was asked for, rather
   * than keeping exceptions made under the other default.
   */
  forget: () => void;
  /** Reads what was saved, then saves every change; returns what stops it. */
  start: () => () => void;
}>;

export const createStackFoldStore = (deps: StackFoldDeps): StackFoldStore => {
  const [choices, setChoices, { updateState: updateChoices }] = createState<
    readonly FoldChoice[]
  >([]);

  // Where a change goes besides the page: kept until `load` answers, then
  // handed to `update`; nowhere before `start` or after it is stopped.
  const mut_saving: { to: 'nowhere' | 'pending' | 'update' } = {
    to: 'nowhere',
  };

  const mut_pending: { changes: readonly Change[] } = { changes: [] };

  const isDrawn = (number: number): boolean =>
    Optional.unwrap(deps.byNumber.getSnapshot()).has(number);

  const foldable = derive([deps.roots, deps.byNumber], (roots, byNumber) =>
    foldableNumbersOf(roots, (number) => byNumber.has(number)).toSorted(
      (a, b) => a - b,
    ),
  ).pipe(skipIfNoChange(fastDeepEqual));

  const folded = derive(
    [choices, foldable, deps.foldByDefault],
    (current, foldableNumbers, foldByDefault) =>
      foldedNumbersOf(current, { foldable: foldableNumbers, foldByDefault }),
  ).pipe(skipIfNoChange(fastDeepEqual));

  const apply = (change: Change): void => {
    updateChoices(change);

    switch (mut_saving.to) {
      case 'nowhere':
        break;

      case 'pending':
        mut_pending.changes = Arr.toPushed(mut_pending.changes, change);

        break;

      case 'update':
        deps.update(change);

        break;
    }
  };

  /**
   * Every stack "fold all" folds now, each with its layers: the tops first, so
   * that the cap on choices drops a layer before a top (`withFoldChoices`).
   */
  const foldableStacks = (): readonly number[] => {
    const roots = Optional.unwrap(deps.roots.getSnapshot());

    const tops = Optional.unwrap(foldable.getSnapshot());

    return [
      ...tops,
      ...tops.flatMap((number) => {
        const stack = stackNumbersOf(roots, number, isDrawn);

        const layers = Arr.tail(stack);

        return layers;
      }),
    ];
  };

  // What "fold all" and "unfold all" leave: the choices that differ from the
  // default, so that a stack that appears later follows the default, and the
  // choices are no more than they need be.
  const replaceWith =
    (fold: boolean): (() => void) =>
    () => {
      const foldByDefault = Optional.unwrap(deps.foldByDefault.getSnapshot());

      const next =
        fold === foldByDefault
          ? ([] as const)
          : withFoldChoices([], foldableStacks(), fold);

      apply(() => next);
    };

  const start = (): (() => void) => {
    const mut_run = { stopped: false };

    mut_saving.to = 'pending';

    const resume = (saved: readonly FoldChoice[]): void => {
      if (mut_run.stopped) {
        return;
      }

      const { changes } = mut_pending;

      mut_pending.changes = [];

      setChoices(changes.reduce((current, change) => change(current), saved));

      mut_saving.to = 'update';

      for (const change of changes) {
        deps.update(change);
      }
    };

    deps
      .load()
      .then(foldChoicesFrom)
      // Nothing could be read: the page starts from nothing saved, and saving
      // is still safe, since each change applies to what is stored.
      .catch(() => [])
      .then(resume)
      .catch(() => undefined);

    return () => {
      mut_run.stopped = true;

      mut_saving.to = 'nowhere';

      mut_pending.changes = [];
    };
  };

  return {
    folded,
    foldable,
    toggle: (number) => {
      const isFolded = Optional.unwrap(folded.getSnapshot()).includes(number);

      const stack = stackNumbersOf(
        Optional.unwrap(deps.roots.getSnapshot()),
        number,
        isDrawn,
      );

      // The whole stack takes the choice, layers folded on their own inside it
      // included: unfolding a stack shows all of it, as unfolding what "fold
      // all" folded does, and its next layer keeps the choice once its top
      // merges.
      apply((current) => withFoldChoices(current, stack, !isFolded));
    },
    foldAll: replaceWith(true),
    unfoldAll: replaceWith(false),
    forget: () => {
      apply(() => []);
    },
    start,
  };
};

type Change = (choices: readonly FoldChoice[]) => readonly FoldChoice[];
