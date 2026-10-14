/**
 * The dialog of one group: its title, for creating it or renaming it, and
 * deleting it — which takes its nodes out of it and leaves them as they
 * are. Nothing is written until `save` or `confirmDelete`; a rename is
 * written onto the group as it is stored at that moment.
 */

import { createState, type InitializedObservable } from 'synstate';
import type { RelaxedExtract } from 'ts-type-forge';
import { asGroupId, type Group, type GroupId } from '../domain/index.mjs';

export type GroupEditorState = Readonly<
  | { type: 'closed' }
  | {
      type: 'open';
      /** Not stored yet: created by `save`. */
      isNew: boolean;
      id: GroupId;
      /** As the field holds it. */
      title: string;
      /** Why the last `save` was refused. */
      error: string | undefined;
      confirmingDelete: boolean;
    }
>;

export type GroupEditorDeps = Readonly<{
  groups: InitializedObservable<readonly Group[]>;
  now: () => number;
  newId: () => string;
  putGroup: (group: Group) => void;
  deleteGroup: (id: GroupId) => void;
}>;

export type GroupEditorStore = Readonly<{
  editor: InitializedObservable<GroupEditorState>;
  /** Opens the dialog of a stored group; does nothing for one that is gone. */
  open: (id: GroupId) => void;
  /** Opens the dialog of a new group, with no title and nothing in it. */
  create: () => void;
  close: () => void;
  setTitle: (title: string) => void;
  /** Writes the title and closes, or says why it cannot. */
  save: () => void;
  requestDelete: () => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
}>;

export const createGroupEditorStore = (
  deps: GroupEditorDeps,
): GroupEditorStore => {
  const [editor, setEditor, { getSnapshot, updateState }] =
    createState<GroupEditorState>(CLOSED);

  const findGroup = (id: GroupId): Group | undefined =>
    deps.groups.getSnapshot().value.find((group) => group.id === id);

  const openWith = (id: GroupId, title: string, isNew: boolean): void => {
    setEditor({
      type: 'open',
      isNew,
      id,
      title,
      error: undefined,
      confirmingDelete: false,
    });
  };

  const updateOpen = (
    update: (
      current: RelaxedExtract<GroupEditorState, Readonly<{ type: 'open' }>>,
    ) => GroupEditorState,
  ): void => {
    updateState((current) =>
      current.type === 'closed' ? current : update(current),
    );
  };

  return {
    editor,
    open: (id) => {
      const group = findGroup(id);

      if (group !== undefined) {
        openWith(group.id, group.title, false);
      }
    },
    create: () => {
      openWith(asGroupId(deps.newId()), '', true);
    },
    close: () => {
      setEditor(CLOSED);
    },
    setTitle: (title) => {
      updateOpen((current) => ({ ...current, title }));
    },
    save: () => {
      const current = getSnapshot();

      if (current.type === 'closed') {
        return;
      }

      const title = current.title.trim();

      if (title === '') {
        setEditor({ ...current, error: 'グループ名を入力してください。' });

        return;
      }

      const now = deps.now();

      const stored = findGroup(current.id);

      deps.putGroup(
        stored === undefined
          ? { id: current.id, title, createdAt: now, updatedAt: now }
          : { ...stored, title, updatedAt: now },
      );

      setEditor(CLOSED);
    },
    requestDelete: () => {
      updateOpen((current) => ({ ...current, confirmingDelete: true }));
    },
    cancelDelete: () => {
      updateOpen((current) => ({ ...current, confirmingDelete: false }));
    },
    confirmDelete: () => {
      const current = getSnapshot();

      if (current.type === 'closed') {
        return;
      }

      if (!current.isNew) {
        deps.deleteGroup(current.id);
      }

      setEditor(CLOSED);
    },
  };
};

const CLOSED: GroupEditorState = { type: 'closed' } as const;
