import {
  createState,
  derive,
  map,
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
  type FoldNode,
} from '../domain/index.mjs';

export type StackFoldDeps = Readonly<{
  /** The tree the merge order draws (`foldTreeOf`), for "fold all". */
  roots: InitializedObservable<readonly FoldNode[]>;
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

/**
 * Which stacks in the merge order are folded (spec §7.4), v1's store.
 *
 * **Whether stacks start folded** is the layout's `foldStacks`, kept in the URL
 * with the rest of the layout. Folded, every pull request "fold all" would fold
 * is folded until the reader unfolds it, a stack that appears later included.
 *
 * **What the reader folds or unfolds** is kept as choices by number, which win
 * over that default, in IndexedDB under the repository's own key: how much of a
 * stack one reader wants to see is not a view worth a link, and a list of
 * numbers growing with every press would lengthen the URL each time. "fold all"
 * and "unfold all" replace the choices, and so does changing the default in the
 * Layout dialog; a link or "Reset" that says otherwise keeps them.
 *
 * **Each change is saved as a change** (`update`), applied to what is stored at
 * the time rather than written over it, so two tabs on one repository each keep
 * what the other saved. Changes made before `load` answers are laid over what
 * it read, in order.
 */
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

  const foldable = deps.roots
    .pipe(map(foldableNumbersOf))
    .pipe(skipIfNoChange(fastDeepEqual));

  const folded = derive(
    [choices, foldable, deps.foldByDefault],
    (current, foldableNumbers, foldByDefault) =>
      foldedNumbersOf(current, { foldable: foldableNumbers, foldByDefault }),
  ).pipe(skipIfNoChange(fastDeepEqual));

  const rootsNow = (): readonly FoldNode[] =>
    Optional.unwrap(deps.roots.getSnapshot());

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
    const tops = Optional.unwrap(foldable.getSnapshot());

    return [
      ...tops,
      ...tops.flatMap((number) => {
        // Bound unannotated, as `Arr.tail` needs to compile here.
        const layers = Arr.tail(stackNumbersOf(rootsNow(), number));

        return layers;
      }),
    ];
  };

  // What "fold all" and "unfold all" leave: the choices that differ from the
  // default, so that a stack that appears later follows the default.
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

      // The whole stack takes the choice, layers folded on their own inside it
      // included: unfolding a stack shows all of it, and its next layer keeps
      // the choice once its top merges.
      apply((current) =>
        withFoldChoices(current, stackNumbersOf(rootsNow(), number), !isFolded),
      );
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
