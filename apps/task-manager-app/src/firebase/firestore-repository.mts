/**
 * The {@link Repository} of one project in Cloud Firestore:
 * `projects/{projectId}/tasks/{taskId}` and
 * `projects/{projectId}/milestones/{milestoneId}`, each document a record
 * without its id, and the DAG's layout in
 * `projects/{projectId}/settings/dagLayout` (`repository/converters.mts`).
 * Every read and write goes through `api/firestore-io.mts`, which prunes
 * each document written to its codec.
 *
 * The listeners hand back local writes at once, and the persistent cache
 * set up in `firebase-backend.mts` keeps the data readable — and writable,
 * queued — offline.
 */

import { collection, doc, type Firestore } from 'firebase/firestore';
import { Result } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import {
  commitBatch,
  putDoc,
  watchCollection,
  watchDoc,
  type DocTarget,
} from '../api/index.mjs';
import {
  type Milestone,
  type MilestoneId,
  type Task,
  type TaskId,
} from '../domain/index.mjs';
import {
  DagLayoutDocCodec,
  dagLayoutFromDoc,
  dagLayoutToDoc,
  MilestoneDocCodec,
  milestoneFromDoc,
  milestoneToDoc,
  readValidDocs,
  TaskDocCodec,
  taskFromDoc,
  taskToDoc,
  type DagLayoutDoc,
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

  const dagLayout: DocTarget<DagLayoutDoc> = {
    ref: doc(firestore, 'projects', projectId, 'settings', 'dagLayout'),
    codec: DagLayoutDocCodec,
  } as const;

  return {
    subscribe: (observer) => {
      let mut_tasks: readonly Task[] | undefined = undefined;

      let mut_milestones: readonly Milestone[] | undefined = undefined;

      // Nothing is handed on until both collections have loaded, so that a
      // task is never shown blocked on a milestone that has not arrived yet.
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
    deleteNode: (ref, { updatedTasks, updatedMilestones }) =>
      commitBatch(firestore, (batch) => {
        batch.delete(doc(collectionOf(ref.kind), ref.id));

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
  };
};

const warn = (message: string): void => {
  console.warn(message);
};
