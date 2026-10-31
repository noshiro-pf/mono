/**
 * The {@link Repository} of one project in Cloud Firestore:
 * `projects/{projectId}/tasks/{taskId}`,
 * `projects/{projectId}/milestones/{milestoneId}` and
 * `projects/{projectId}/groups/{groupId}`, each document a record without its
 * id, and the DAG's layout in `projects/{projectId}/settings/dagLayout`
 * (`repository/converters.mts`).
 * Every read and write goes through `api/firestore-io.mts`, which prunes each
 * document written to its codec.
 *
 * The listeners hand back local writes at once, and the persistent cache set up
 * in `firebase-backend.mts` keeps the data readable — and writable, queued —
 * offline.
 */

import { collection, doc, type Firestore } from 'firebase/firestore';
import { Result } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import {
  commitBatch,
  commitInBatches,
  putDoc,
  watchCollection,
  watchDoc,
  type DocTarget,
} from '../api/index.mjs';
import type {
  GroupId,
  Milestone,
  MilestoneId,
  Task,
  TaskId,
} from '../domain/index.mjs';
import {
  DagLayoutDocCodec,
  dagLayoutFromDoc,
  dagLayoutToDoc,
  GroupDocCodec,
  groupFromDoc,
  groupToDoc,
  MilestoneDocCodec,
  milestoneFromDoc,
  milestoneToDoc,
  readValidDocs,
  TaskDocCodec,
  taskFromDoc,
  taskToDoc,
  type DagLayoutDoc,
  type GroupDoc,
  type MilestoneDoc,
  type Repository,
  type TaskDoc,
} from '../repository/index.mjs';

export const createFirestoreRepository = (
  firestore: DeepReadonly<Firestore>,
  projectId: string,
): Repository => {
  const tasks = collection(firestore, 'projects', projectId, 'tasks');

  const milestones = collection(firestore, 'projects', projectId, 'milestones');

  const groups = collection(firestore, 'projects', projectId, 'groups');

  const collectionOf = (kind: 'task' | 'milestone'): typeof tasks =>
    kind === 'task' ? tasks : milestones;

  const taskDoc = (id: TaskId): DocTarget<TaskDoc> =>
    ({
      ref: doc(tasks, id),
      codec: TaskDocCodec,
    }) as const;

  const milestoneDoc = (id: MilestoneId): DocTarget<MilestoneDoc> =>
    ({
      ref: doc(milestones, id),
      codec: MilestoneDocCodec,
    }) as const;

  const groupDoc = (id: GroupId): DocTarget<GroupDoc> =>
    ({
      ref: doc(groups, id),
      codec: GroupDocCodec,
    }) as const;

  const dagLayout: DocTarget<DagLayoutDoc> = {
    ref: doc(firestore, 'projects', projectId, 'settings', 'dagLayout'),
    codec: DagLayoutDocCodec,
  } as const;

  return {
    subscribe: (observer) => {
      let mut_tasks: readonly Task[] | undefined = undefined;

      let mut_milestones: readonly Milestone[] | undefined = undefined;

      // Nothing is handed on until both collections have loaded, so that a task
      // is never shown blocked on a milestone that has not arrived yet.
      const emit = (): void => {
        if (mut_tasks !== undefined && mut_milestones !== undefined) {
          observer.next({ tasks: mut_tasks, milestones: mut_milestones });
        }
      };

      const stopTasks = watchCollection(tasks, {
        next: (docs) => {
          mut_tasks = readValidDocs(docs, taskFromDoc, warn);

          emit();
        },
        error: observer.error,
      });

      const stopMilestones = watchCollection(milestones, {
        next: (docs) => {
          mut_milestones = readValidDocs(docs, milestoneFromDoc, warn);

          emit();
        },
        error: observer.error,
      });

      return () => {
        stopTasks();

        stopMilestones();
      };
    },
    putTask: (task) => putDoc(taskDoc(task.id), taskToDoc(task)),
    putMilestone: (milestone) =>
      putDoc(milestoneDoc(milestone.id), milestoneToDoc(milestone)),
    deleteNodes: (refs, { updatedTasks, updatedMilestones }) =>
      commitBatch(firestore, (batch) => {
        for (const ref of refs) {
          batch.delete(doc(collectionOf(ref.kind), ref.id));
        }

        for (const task of updatedTasks) {
          batch.set(taskDoc(task.id), taskToDoc(task));
        }

        for (const milestone of updatedMilestones) {
          batch.set(milestoneDoc(milestone.id), milestoneToDoc(milestone));
        }
      }),
    putNodes: ({ updatedTasks, updatedMilestones }) =>
      commitBatch(firestore, (batch) => {
        for (const task of updatedTasks) {
          batch.set(taskDoc(task.id), taskToDoc(task));
        }

        for (const milestone of updatedMilestones) {
          batch.set(milestoneDoc(milestone.id), milestoneToDoc(milestone));
        }
      }),
    subscribeGroups: (observer) =>
      watchCollection(groups, {
        next: (docs) => {
          observer.next(readValidDocs(docs, groupFromDoc, warn));
        },
        error: observer.error,
      }),
    putGroup: (group) => putDoc(groupDoc(group.id), groupToDoc(group)),
    deleteGroup: (id, { updatedTasks, updatedMilestones }) =>
      commitBatch(firestore, (batch) => {
        batch.delete(doc(groups, id));

        for (const task of updatedTasks) {
          batch.set(taskDoc(task.id), taskToDoc(task));
        }

        for (const milestone of updatedMilestones) {
          batch.set(milestoneDoc(milestone.id), milestoneToDoc(milestone));
        }
      }),
    subscribeDagLayout: (observer) =>
      watchDoc(dagLayout.ref, {
        next: (data) => {
          if (data === undefined) {
            observer.next(undefined);

            return;
          }

          const layout = dagLayoutFromDoc(data);

          if (Result.isErr(layout)) {
            warn(`Ignored an invalid DAG layout: ${layout.value.join('; ')}`);

            observer.next(undefined);

            return;
          }

          observer.next(layout.value);
        },
        error: observer.error,
      }),
    putDagLayout: (layout, updatedAt) =>
      putDoc(dagLayout, dagLayoutToDoc(layout, updatedAt)),
    replaceProject: async (next, previous, updatedAt) => {
      // What is written is sent, and confirmed, before anything is deleted, so
      // that a failure leaves more than before, never less.
      await commitInBatches(firestore, (batch) => {
        for (const task of next.state.tasks) {
          batch.set(taskDoc(task.id), taskToDoc(task));
        }

        for (const milestone of next.state.milestones) {
          batch.set(milestoneDoc(milestone.id), milestoneToDoc(milestone));
        }

        for (const group of next.groups) {
          batch.set(groupDoc(group.id), groupToDoc(group));
        }

        if (next.dagLayout !== undefined) {
          batch.set(dagLayout, dagLayoutToDoc(next.dagLayout, updatedAt));
        }
      });

      await commitInBatches(firestore, (batch) => {
        if (next.dagLayout === undefined && previous.dagLayout !== undefined) {
          batch.delete(dagLayout.ref);
        }

        for (const [collectionRef, before, after] of [
          [tasks, previous.state.tasks, next.state.tasks],
          [milestones, previous.state.milestones, next.state.milestones],
          [groups, previous.groups, next.groups],
        ] as const) {
          const kept = new Set<string>(after.map(({ id }) => id));

          for (const { id } of before) {
            if (!kept.has(id)) {
              batch.delete(doc(collectionRef, id));
            }
          }
        }
      });
    },
  };
};

const warn = (message: string): void => {
  console.warn(message);
};
