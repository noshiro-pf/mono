/**
 * The dialog of one task or milestone: which node, its draft, and what is
 * wrong with it. Nothing is written until `save` — and then onto the node as
 * it is stored at that moment, so a change that arrived from another tab
 * while the dialog was open is kept for every field the form does not show.
 *
 * What a draft means is `view-model/task-draft.mts` and
 * `milestone-draft.mts`; the dependencies are edited as rows, which are
 * `view-model/dependency-edit.mts`. A row is saved as it is typed, with no
 * separate step to add it, and a row that is wrong holds the save back —
 * the dialog shows why under the row.
 */

import { createState, type InitializedObservable } from 'synstate';
import { Result } from 'ts-data-forge';
import type { DeepReadonly, RelaxedExclude, StrictOmit } from 'ts-type-forge';
import {
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type Dependency,
  type DomainState,
  type Milestone,
  type MilestoneId,
  type NodeRef,
  type Task,
  type TaskId,
} from '../domain/index.mjs';
import {
  appendEmptyRow,
  applyMilestoneDraft,
  applyTaskDraft,
  dependenciesFromRows,
  milestoneToDraft,
  removeRow,
  rowsFromDependencies,
  taskToDraft,
  updateRow,
  type DependencyRow,
  type MilestoneDraft,
  type TaskDraft,
} from '../view-model/index.mjs';

type EditorCommon = DeepReadonly<{
  /** Not stored yet: created by `save`. */
  isNew: boolean;
  /** Why the last `save` was refused, for a reason other than a row. */
  error: string | undefined;
  /**
   * The dependencies as they are being edited: one row per dependency the
   * node had when the dialog opened, then an empty one to fill in.
   */
  rows: DependencyRow[];
  confirmingDelete: boolean;
}>;

export type EditorState =
  | Readonly<{ type: 'closed' }>
  | (EditorCommon &
      Readonly<{
        type: 'task';
        ref: Readonly<{ kind: 'task'; id: TaskId }>;
        draft: TaskDraft;
      }>)
  | (EditorCommon &
      Readonly<{
        type: 'milestone';
        ref: Readonly<{ kind: 'milestone'; id: MilestoneId }>;
        draft: MilestoneDraft;
      }>);

export type EditorDeps = Readonly<{
  state: InitializedObservable<DomainState>;
  now: () => number;
  newId: () => string;
  /** `undefined` for the browser's. */
  timeZone: string | undefined;
  putTask: (task: Task) => void;
  putMilestone: (milestone: Milestone) => void;
  deleteNode: (ref: NodeRef) => void;
}>;

export type EditorStore = Readonly<{
  editor: InitializedObservable<EditorState>;
  /** Opens the dialog of a stored node; does nothing for one that is gone. */
  open: (ref: NodeRef) => void;
  createTask: () => void;
  createMilestone: () => void;
  close: () => void;
  updateTaskDraft: (patch: Partial<TaskDraft>) => void;
  updateMilestoneDraft: (patch: Partial<MilestoneDraft>) => void;
  /** Resolves the manual check now. */
  check: () => void;
  uncheck: () => void;
  /** Appends an empty row; nothing is added until `save`. */
  addDependencyRow: () => void;
  updateDependencyRow: (
    key: number,
    patch: Partial<StrictOmit<DependencyRow, 'key'>>,
  ) => void;
  removeDependencyRow: (key: number) => void;
  /**
   * Writes the draft and the rows' dependencies, and closes. Does nothing
   * while a row is wrong (the rows say why); otherwise says what is wrong
   * with the draft.
   */
  save: () => void;
  requestDelete: () => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
}>;

export const createEditorStore = (deps: EditorDeps): EditorStore => {
  const [editor, setEditor, { getSnapshot, updateState }] =
    createState<EditorState>(CLOSED);

  const currentState = (): DomainState => deps.state.getSnapshot().value;

  const findTask = (id: TaskId): Task | undefined =>
    currentState().tasks.find((task) => task.id === id);

  const findMilestone = (id: MilestoneId): Milestone | undefined =>
    currentState().milestones.find((milestone) => milestone.id === id);

  const openTask = (task: Task, isNew: boolean): void => {
    setEditor({
      ...freshCommon(isNew, task.dependencies),
      type: 'task',
      ref: { kind: 'task', id: task.id },
      draft: taskToDraft(task, deps.timeZone),
    });
  };

  const openMilestone = (milestone: Milestone, isNew: boolean): void => {
    setEditor({
      ...freshCommon(isNew, milestone.dependencies),
      type: 'milestone',
      ref: { kind: 'milestone', id: milestone.id },
      draft: milestoneToDraft(milestone, deps.timeZone),
    });
  };

  const updateOpen = (
    update: (current: OpenEditorState) => EditorState,
  ): void => {
    updateState((current) =>
      current.type === 'closed' ? current : update(current),
    );
  };

  const save = (): void => {
    const current = getSnapshot();

    if (current.type === 'closed') {
      return;
    }

    const dependencies = dependenciesFromRows(
      currentState(),
      current.ref,
      current.rows,
    );

    if (Result.isErr(dependencies)) {
      return;
    }

    const now = deps.now();

    switch (current.type) {
      case 'task': {
        const base =
          findTask(current.ref.id) ??
          createTask({ id: current.ref.id, title: '', now });

        const result = applyTaskDraft(
          { ...base, dependencies: dependencies.value },
          current.draft,
          now,
          deps.timeZone,
        );

        if (Result.isErr(result)) {
          setEditor({ ...current, error: result.value });

          break;
        }

        deps.putTask(result.value);

        setEditor(CLOSED);

        break;
      }

      case 'milestone': {
        const base =
          findMilestone(current.ref.id) ??
          createMilestone({ id: current.ref.id, title: '', now });

        const result = applyMilestoneDraft(
          { ...base, dependencies: dependencies.value },
          current.draft,
          now,
          deps.timeZone,
        );

        if (Result.isErr(result)) {
          setEditor({ ...current, error: result.value });

          break;
        }

        deps.putMilestone(result.value);

        setEditor(CLOSED);

        break;
      }
    }
  };

  return {
    editor,
    open: (ref) => {
      if (ref.kind === 'task') {
        const task = findTask(ref.id);

        if (task !== undefined) {
          openTask(task, false);
        }
      } else {
        const milestone = findMilestone(ref.id);

        if (milestone !== undefined) {
          openMilestone(milestone, false);
        }
      }
    },
    createTask: () => {
      openTask(
        createTask({ id: asTaskId(deps.newId()), title: '', now: deps.now() }),
        true,
      );
    },
    createMilestone: () => {
      openMilestone(
        createMilestone({
          id: asMilestoneId(deps.newId()),
          title: '',
          now: deps.now(),
        }),
        true,
      );
    },
    close: () => {
      setEditor(CLOSED);
    },
    updateTaskDraft: (patch) => {
      updateOpen((current) =>
        current.type === 'task'
          ? { ...current, draft: { ...current.draft, ...patch } }
          : current,
      );
    },
    updateMilestoneDraft: (patch) => {
      updateOpen((current) =>
        current.type === 'milestone'
          ? { ...current, draft: { ...current.draft, ...patch } }
          : current,
      );
    },
    check: () => {
      updateOpen((current) =>
        current.type === 'milestone'
          ? {
              ...current,
              draft: { ...current.draft, checkedAt: deps.now() },
            }
          : current,
      );
    },
    uncheck: () => {
      updateOpen((current) =>
        current.type === 'milestone'
          ? { ...current, draft: { ...current.draft, checkedAt: undefined } }
          : current,
      );
    },
    addDependencyRow: () => {
      updateOpen((current) => ({
        ...current,
        rows: appendEmptyRow(current.rows),
      }));
    },
    updateDependencyRow: (key, patch) => {
      updateOpen((current) => ({
        ...current,
        rows: updateRow(current.rows, key, patch),
      }));
    },
    removeDependencyRow: (key) => {
      updateOpen((current) => ({
        ...current,
        rows: removeRow(current.rows, key),
      }));
    },
    save,
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
        deps.deleteNode(current.ref);
      }

      setEditor(CLOSED);
    },
  };
};

type OpenEditorState = RelaxedExclude<
  EditorState,
  Readonly<{ type: 'closed' }>
>;

const CLOSED: EditorState = { type: 'closed' } as const;

const freshCommon = (
  isNew: boolean,
  dependencies: readonly Dependency[],
): EditorCommon =>
  ({
    isNew,
    error: undefined,
    rows: appendEmptyRow(rowsFromDependencies(dependencies)),
    confirmingDelete: false,
  }) as const;
