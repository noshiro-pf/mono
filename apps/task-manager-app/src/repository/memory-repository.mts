import { Arr } from 'ts-data-forge';
import { type DagLayout } from '../dag/index.mjs';
import { nodeId, type DomainState, type NodeRef } from '../domain/index.mjs';
import {
  type DagLayoutObserver,
  type NodeCleanup,
  type Repository,
  type RepositoryObserver,
} from './repository.mjs';

/**
 * A {@link Repository} that keeps the state in memory, starting from
 * `initial` (and the DAG's layout from `initialLayout`, none by default):
 * for the tests, and for the demo (`?storage=memory`), where reloading the
 * page starts over.
 *
 * Every write is applied and handed to the subscribers before its promise
 * resolves, as Firestore hands local writes to its listeners at once.
 */
export const createMemoryRepository = (
  initial: DomainState,
  initialLayout?: DagLayout,
): Repository => {
  let mut_state = initial;

  let mut_layout = initialLayout;

  const mut_observers = new Set<RepositoryObserver>();

  const mut_layoutObservers = new Set<DagLayoutObserver>();

  const update = (next: DomainState): Promise<void> => {
    mut_state = next;

    for (const observer of mut_observers) {
      observer.next(mut_state);
    }

    return Promise.resolve();
  };

  return {
    subscribe: (observer) => {
      mut_observers.add(observer);

      observer.next(mut_state);

      return () => {
        mut_observers.delete(observer);
      };
    },
    putTask: (task) =>
      update({
        tasks: upsert(mut_state.tasks, task),
        milestones: mut_state.milestones,
      }),
    putMilestone: (milestone) =>
      update({
        tasks: mut_state.tasks,
        milestones: upsert(mut_state.milestones, milestone),
      }),
    deleteNode: (ref, cleanup) => update(withDeleted(mut_state, ref, cleanup)),
    subscribeDagLayout: (observer) => {
      mut_layoutObservers.add(observer);

      observer.next(mut_layout);

      return () => {
        mut_layoutObservers.delete(observer);
      };
    },
    putDagLayout: (layout) => {
      mut_layout = layout;

      for (const observer of mut_layoutObservers) {
        observer.next(mut_layout);
      }

      return Promise.resolve();
    },
  };
};

/** `items` with `item` in place of the one with its id, or appended. */
const upsert = <T extends Readonly<{ id: string }>>(
  items: readonly T[],
  item: T,
): readonly T[] =>
  items.some(({ id }) => id === item.id)
    ? items.map((existing) => (existing.id === item.id ? item : existing))
    : Arr.toPushed(items, item);

const upsertAll = <T extends Readonly<{ id: string }>>(
  items: readonly T[],
  updates: readonly T[],
): readonly T[] =>
  updates.reduce<readonly T[]>((acc, item) => upsert(acc, item), items);

const withDeleted = (
  state: DomainState,
  ref: NodeRef,
  { updatedTasks, updatedMilestones }: NodeCleanup,
): DomainState => {
  const deletedId = nodeId(ref);

  return {
    tasks: upsertAll(
      state.tasks.filter(
        ({ id }) => nodeId({ kind: 'task', id }) !== deletedId,
      ),
      updatedTasks,
    ),
    milestones: upsertAll(
      state.milestones.filter(
        ({ id }) => nodeId({ kind: 'milestone', id }) !== deletedId,
      ),
      updatedMilestones,
    ),
  };
};
