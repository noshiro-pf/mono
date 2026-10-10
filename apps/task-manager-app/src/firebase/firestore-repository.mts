/**
 * The {@link Repository} of one project in Cloud Firestore:
 * `projects/{projectId}/tasks/{taskId}` and
 * `projects/{projectId}/milestones/{milestoneId}`, each document a record
 * without its id, and the DAG's layout in
 * `projects/{projectId}/settings/dagLayout` (`repository/converters.mts`).
 *
 * The listeners hand back local writes at once, and the persistent cache
 * set up in `firebase-backend.mts` keeps the data readable — and writable,
 * queued — offline.
 */

import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { Result } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import type { Milestone, Task } from '../domain/index.mjs';
import {
  dagLayoutFromDoc,
  dagLayoutToDoc,
  milestoneFromDoc,
  milestoneToDoc,
  readValidDocs,
  taskFromDoc,
  taskToDoc,
  type Repository,
} from '../repository/index.mjs';

export const createFirestoreRepository = (
  firestore: DeepReadonly<Firestore>,
  projectId: string,
): Repository => {
  const tasks = collection(firestore, 'projects', projectId, 'tasks');

  const milestones = collection(firestore, 'projects', projectId, 'milestones');

  const collectionOf = (kind: 'task' | 'milestone'): typeof tasks =>
    kind === 'task' ? tasks : milestones;

  const dagLayout = doc(
    firestore,
    'projects',
    projectId,
    'settings',
    'dagLayout',
  );

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

      const stopTasks = onSnapshot(
        tasks,
        (snapshot) => {
          mut_tasks = readValidDocs(
            snapshot.docs.map((snapshotDoc) => ({
              id: snapshotDoc.id,
              data: snapshotDoc.data(),
            })),
            taskFromDoc,
            warn,
          );

          emit();
        },
        observer.error,
      );

      const stopMilestones = onSnapshot(
        milestones,
        (snapshot) => {
          mut_milestones = readValidDocs(
            snapshot.docs.map((snapshotDoc) => ({
              id: snapshotDoc.id,
              data: snapshotDoc.data(),
            })),
            milestoneFromDoc,
            warn,
          );

          emit();
        },
        observer.error,
      );

      return () => {
        stopTasks();

        stopMilestones();
      };
    },
    putTask: (task) => setDoc(doc(tasks, task.id), taskToDoc(task)),
    putMilestone: (milestone) =>
      setDoc(doc(milestones, milestone.id), milestoneToDoc(milestone)),
    deleteNode: (ref, { updatedTasks, updatedMilestones }) => {
      const batch = writeBatch(firestore);

      batch.delete(doc(collectionOf(ref.kind), ref.id));

      for (const task of updatedTasks) {
        batch.set(doc(tasks, task.id), taskToDoc(task));
      }

      for (const milestone of updatedMilestones) {
        batch.set(doc(milestones, milestone.id), milestoneToDoc(milestone));
      }

      return batch.commit();
    },
    subscribeDagLayout: (observer) =>
      onSnapshot(
        dagLayout,
        (snapshot) => {
          if (!snapshot.exists()) {
            observer.next(undefined);

            return;
          }

          const layout = dagLayoutFromDoc(snapshot.data());

          if (Result.isErr(layout)) {
            warn(`Ignored an invalid DAG layout: ${layout.value.join('; ')}`);

            observer.next(undefined);

            return;
          }

          observer.next(layout.value);
        },
        observer.error,
      ),
    putDagLayout: (layout, updatedAt) =>
      setDoc(dagLayout, dagLayoutToDoc(layout, updatedAt)),
  };
};

const warn = (message: string): void => {
  console.warn(message);
};
