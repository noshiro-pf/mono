import { Arr } from 'ts-data-forge';
import {
  activateEntry,
  addEntry,
  mergeImported,
  moveEntry,
  nextName,
  removeEntry,
  renameEntry,
  resolveShown,
  setEntryPinned,
  type SplitViewList,
} from './list.mjs';

/**
 * A change to the saved list, as a page asks the service worker for it (spec
 * W10). The worker is the only writer of `workspaceRegistry`: it applies one
 * operation at a time to the list as stored, so two tabs changing the list at
 * once both land, where two tabs each writing a whole list of their own would
 * drop each other's change.
 *
 * Whatever is random or timed is chosen by the page and travels in the
 * operation (`id`, `freshId`, `now`), so that applying one is a pure function.
 */
export type ListOp = Readonly<
  | {
      /** A page loading: what its URL asks for, resolved (spec U3). */
      kind: 'show';
      id: string | undefined;
      name: string | undefined;
      now: number;
      /** Whether the tab is visible, and so the one looked at last. */
      activate: boolean;
    }
  | { kind: 'create'; id: string; now: number }
  | {
      kind: 'remove';
      id: string;
      /** The id of the fresh split view that replaces the last one. */
      freshId: string;
      now: number;
    }
  | { kind: 'rename'; id: string; name: string }
  | { kind: 'move'; id: string; offset: number }
  | { kind: 'activate'; id: string }
  | { kind: 'set-pinned'; id: string; pinned: boolean }
  | {
      kind: 'import';
      entries: readonly Readonly<{ id: string; name: string }>[];
      now: number;
    }
>;

/** What an operation tells the page besides the list. */
export type ListAnswer = Readonly<
  | { kind: 'none' }
  | { kind: 'shown'; id: string }
  | { kind: 'imported'; added: number; replaced: number }
>;

/** An operation applied; a list that does not change is returned as it was. */
export const applyListOp = (
  list: SplitViewList,
  op: ListOp,
): Readonly<{ list: SplitViewList; answer: ListAnswer }> => {
  switch (op.kind) {
    case 'show': {
      const shown = resolveShown(
        list,
        { id: op.id, name: op.name },
        op.now,
        op.activate,
      );

      return { list: shown.list, answer: { kind: 'shown', id: shown.id } };
    }

    case 'create':
      return unanswered(
        addEntry(list, {
          id: op.id,
          name: nextName(list),
          createdAt: op.now,
          pinned: false,
        }),
      );

    case 'remove': {
      const without = removeEntry(list, op.id);

      return unanswered(
        without === list || Arr.isNonEmpty(without.entries)
          ? without
          : activateEntry(
              addEntry(without, {
                id: op.freshId,
                name: nextName(without),
                createdAt: op.now,
                pinned: false,
              }),
              op.freshId,
            ),
      );
    }

    case 'rename':
      return unanswered(renameEntry(list, op.id, op.name));

    case 'move':
      return unanswered(moveEntry(list, op.id, op.offset));

    case 'activate':
      return unanswered(activateEntry(list, op.id));

    case 'set-pinned':
      return unanswered(setEntryPinned(list, op.id, op.pinned));

    case 'import': {
      const merged = mergeImported(list, op.entries, op.now);

      return {
        list: merged.list,
        answer: {
          kind: 'imported',
          added: merged.added,
          replaced: merged.replaced,
        },
      };
    }
  }
};

const unanswered = (
  list: SplitViewList,
): Readonly<{ list: SplitViewList; answer: ListAnswer }> =>
  ({
    list,
    answer: { kind: 'none' },
  }) as const;
