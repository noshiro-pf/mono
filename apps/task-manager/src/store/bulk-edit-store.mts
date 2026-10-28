/**
 * The dialog of 「一括編集」: what to change in every node selected on the
 * DAG at once — the progress and the labels of the tasks among them, and
 * the group of all of them. Every field starts at 「変更しない」, and
 * nothing is written until `save`, which writes every node it changes in
 * one go (`dataStore.editNodes`).
 */

import { createState, type InitializedObservable } from 'synstate';
import { Arr } from 'ts-data-forge';
import type { RelaxedExtract } from 'ts-type-forge';
import type { NodeEdit, NodeRef, Progress } from '../domain/index.mjs';
import { parseLabels } from '../view-model/index.mjs';

export type BulkEditState = Readonly<
  | { type: 'closed' }
  | {
      type: 'open';
      /** The nodes edited: those selected when it opened. */
      refs: readonly NodeRef[];
      /** `undefined` for 「変更しない」. */
      progress: Progress | undefined;
      /** The labels to add, separated by commas (`formatLabels`). */
      addLabels: string;
      /** Labels the tasks have that are ticked to take off. */
      removeLabels: readonly string[];
      /** `undefined` for 「変更しない」. */
      group: NodeEdit['group'];
    }
>;

export type BulkEditDeps = Readonly<{
  editNodes: (refs: readonly NodeRef[], edit: NodeEdit) => void;
}>;

export type BulkEditStore = Readonly<{
  editor: InitializedObservable<BulkEditState>;
  /** Opens the dialog for `refs`, every field at 「変更しない」. */
  open: (refs: readonly NodeRef[]) => void;
  close: () => void;
  setProgress: (progress: Progress | undefined) => void;
  setAddLabels: (text: string) => void;
  /** Ticks `label` to take off, or clears its tick. */
  toggleRemoveLabel: (label: string) => void;
  setGroup: (group: NodeEdit['group']) => void;
  /** Writes the changes and closes. */
  save: () => void;
}>;

export const createBulkEditStore = (deps: BulkEditDeps): BulkEditStore => {
  const [editor, setEditor, { getSnapshot, updateState }] =
    createState<BulkEditState>(CLOSED);

  const updateOpen = (
    update: (
      current: RelaxedExtract<BulkEditState, Readonly<{ type: 'open' }>>,
    ) => BulkEditState,
  ): void => {
    updateState((current) =>
      current.type === 'closed' ? current : update(current),
    );
  };

  return {
    editor,
    open: (refs) => {
      setEditor({
        type: 'open',
        refs,
        progress: undefined,
        addLabels: '',
        removeLabels: [],
        group: undefined,
      });
    },
    close: () => {
      setEditor(CLOSED);
    },
    setProgress: (progress) => {
      updateOpen((current) => ({ ...current, progress }));
    },
    setAddLabels: (addLabels) => {
      updateOpen((current) => ({ ...current, addLabels }));
    },
    toggleRemoveLabel: (label) => {
      updateOpen((current) => ({
        ...current,
        removeLabels: current.removeLabels.includes(label)
          ? current.removeLabels.filter((removed) => removed !== label)
          : Arr.toPushed(current.removeLabels, label),
      }));
    },
    setGroup: (group) => {
      updateOpen((current) => ({ ...current, group }));
    },
    save: () => {
      const current = getSnapshot();

      if (current.type === 'closed') {
        return;
      }

      deps.editNodes(current.refs, {
        progress: current.progress,
        addLabels: parseLabels(current.addLabels),
        removeLabels: current.removeLabels,
        group: current.group,
      });

      setEditor(CLOSED);
    },
  };
};

const CLOSED: BulkEditState = { type: 'closed' } as const;
