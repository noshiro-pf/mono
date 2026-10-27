/**
 * Where the tasks and milestones of one project are kept, with their groups
 * and the layout of its DAG: Firestore when signed in (`firebase/`), memory in the tests and
 * the demo (`memory-repository.mts`). The store sees only this.
 */

import type { DeepReadonly } from 'ts-type-forge';
import type { DagLayout } from '../dag/index.mjs';
import type {
  DomainState,
  Group,
  GroupId,
  Milestone,
  NodeRef,
  Task,
} from '../domain/index.mjs';

export type Repository = Readonly<{
  /**
   * Hands `observer.next` the whole state once it has loaded, and again on
   * every change after — local writes included, before they are confirmed.
   * Returns what stops it.
   */
  subscribe: (observer: RepositoryObserver) => () => void;
  /** Creates or replaces the task with its id. */
  putTask: (task: Task) => Promise<void>;
  /** Creates or replaces the milestone with its id. */
  putMilestone: (milestone: Milestone) => Promise<void>;
  /**
   * Deletes the nodes `refs` and writes the nodes `cleanup` names — those
   * whose dependencies on them were removed (see `removeNodes`) — all
   * together, so that nothing is left depending on a node that is gone.
   */
  deleteNodes: (
    refs: readonly NodeRef[],
    cleanup: NodeCleanup,
  ) => Promise<void>;
  /**
   * Creates or replaces every task and milestone `nodes` names, all
   * together: those edited at once (see `editNodes`).
   */
  putNodes: (nodes: NodeCleanup) => Promise<void>;
  /**
   * Hands `observer.next` every group once they have loaded, in creation
   * order, and again on every change after, local writes included. Returns
   * what stops it.
   */
  subscribeGroups: (observer: GroupsObserver) => () => void;
  /** Creates or replaces the group with its id. */
  putGroup: (group: Group) => Promise<void>;
  /**
   * Deletes the group `id` and writes the nodes `cleanup` names — those
   * that were in it (see `removeGroup`) — all together.
   */
  deleteGroup: (id: GroupId, cleanup: NodeCleanup) => Promise<void>;
  /**
   * Hands `observer.next` the DAG's layout once it has loaded — `undefined`
   * if there is none, or the stored one is invalid — and again on every
   * change after, local writes included. Returns what stops it.
   */
  subscribeDagLayout: (observer: DagLayoutObserver) => () => void;
  /** Replaces the DAG's layout, stamped `updatedAt`. */
  putDagLayout: (layout: DagLayout, updatedAt: number) => Promise<void>;
}>;

export type RepositoryObserver = Readonly<{
  next: (state: DomainState) => void;
  error: (error: unknown) => void;
}>;

export type GroupsObserver = Readonly<{
  next: (groups: readonly Group[]) => void;
  error: (error: unknown) => void;
}>;

export type DagLayoutObserver = Readonly<{
  next: (layout: DagLayout | undefined) => void;
  error: (error: unknown) => void;
}>;

export type NodeCleanup = DeepReadonly<{
  updatedTasks: Task[];
  updatedMilestones: Milestone[];
}>;

/** Signing in and out, and the repository of whoever is signed in. */
export type Backend = Readonly<{
  /**
   * Hands `listener` the session as soon as it is known, and again whenever
   * it changes. Returns what stops it.
   */
  watchSession: (listener: (session: BackendSession) => void) => () => void;
  signIn: () => Promise<void>;
  /**
   * Signs out, and removes what this device kept of the data. Writes made
   * offline are sent first; when they cannot be, nothing happens and
   * `'unsent-writes'` says so, unless `discardUnsentWrites` gives them up.
   */
  signOut: (
    options: Readonly<{ discardUnsentWrites: boolean }>,
  ) => Promise<SignOutResult>;
}>;

export type SignOutResult = 'signed-out' | 'unsent-writes';

export type BackendSession = Readonly<
  | { type: 'signed-out' }
  | {
      type: 'signed-in';
      /** Shown in the header. */
      userName: string;
      repository: Repository;
    }
>;
