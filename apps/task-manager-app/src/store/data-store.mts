/**
 * The tasks and milestones of the signed-in user, and the writes to them.
 *
 * Follows the session: signing in subscribes to that user's repository,
 * signing out drops it and empties the state. Writes go to the repository
 * and come back through the subscription — the repository hands local
 * writes back at once, so there is one way state changes, not two. A write
 * that fails is reported, not thrown: by then the reader has moved on.
 *
 * The DAG's layout is followed and written the same way, apart from the
 * tasks: it changes far less often, and a task never waits for it.
 */

import { createState, type InitializedObservable } from 'synstate';
import type { DagLayout } from '../dag/index.mjs';
import {
  removeNode,
  type DomainState,
  type Milestone,
  type NodeRef,
  type Task,
} from '../domain/index.mjs';
import type { Repository } from '../repository/index.mjs';
import type { Session } from './session-store.mjs';

export type DataStatus = 'idle' | 'loading' | 'ready';

export type DataDeps = Readonly<{
  session: InitializedObservable<Session>;
  now: () => number;
  /** Tells the reader; `error` is the cause, for the console. */
  reportError: (message: string, error?: unknown) => void;
}>;

export type DataStore = Readonly<{
  /** Empty until loaded, and while nobody is signed in. */
  state: InitializedObservable<DomainState>;
  status: InitializedObservable<DataStatus>;
  /** The project's DAG layout; `undefined` while it has none. */
  dagLayout: InitializedObservable<DagLayout | undefined>;
  putTask: (task: Task) => void;
  putMilestone: (milestone: Milestone) => void;
  /** Deletes the node and every dependency on it, in one write. */
  deleteNode: (ref: NodeRef) => void;
  putDagLayout: (layout: DagLayout) => void;
  /** Starts following the session, and returns what stops it. */
  start: () => () => void;
}>;

export const EMPTY_STATE: DomainState = { tasks: [], milestones: [] } as const;

export const createDataStore = (deps: DataDeps): DataStore => {
  const [state, setState, { getSnapshot: getState }] =
    createState<DomainState>(EMPTY_STATE);

  const [dataStatus, setDataStatus] = createState<DataStatus>('idle');

  const [dagLayout, setDagLayout] = createState<DagLayout | undefined>(
    undefined,
  );

  let mut_repository: Repository | undefined = undefined;

  const write = (
    describe: string,
    run: (repository: Repository) => Promise<void>,
  ): void => {
    const current = mut_repository;

    if (current === undefined) {
      deps.reportError(
        `${describe}できませんでした（サインインしていません）。`,
      );

      return;
    }

    run(current).catch((error: unknown) => {
      deps.reportError(`${describe}できませんでした。`, error);
    });
  };

  const start = (): (() => void) => {
    let mut_stopRepository: (() => void) | undefined = undefined;

    const stopFollowing = (): void => {
      mut_stopRepository?.();

      mut_stopRepository = undefined;

      mut_repository = undefined;
    };

    const subscription = deps.session.subscribe((session) => {
      if (
        session.type === 'signed-in' &&
        session.repository === mut_repository
      ) {
        return;
      }

      stopFollowing();

      setState(EMPTY_STATE);

      setDagLayout(undefined);

      if (session.type !== 'signed-in') {
        setDataStatus('idle');

        return;
      }

      setDataStatus('loading');

      mut_repository = session.repository;

      const stopState = session.repository.subscribe({
        next: (next) => {
          setState(next);

          setDataStatus('ready');
        },
        error: (error) => {
          deps.reportError(
            'データを読み込めませんでした。権限の設定か接続を確認してください。',
            error,
          );
        },
      });

      const stopLayout = session.repository.subscribeDagLayout({
        next: setDagLayout,
        error: (error) => {
          deps.reportError('DAG の配置を読み込めませんでした。', error);
        },
      });

      mut_stopRepository = () => {
        stopState();

        stopLayout();
      };
    });

    return () => {
      subscription.unsubscribe();

      stopFollowing();
    };
  };

  return {
    state,
    status: dataStatus,
    dagLayout,
    putTask: (task) => {
      write('タスクを保存', (repository) => repository.putTask(task));
    },
    putMilestone: (milestone) => {
      write('マイルストーンを保存', (repository) =>
        repository.putMilestone(milestone),
      );
    },
    deleteNode: (ref) => {
      write('削除', (repository) =>
        repository.deleteNode(ref, removeNode(getState(), ref, deps.now())),
      );
    },
    putDagLayout: (layout) => {
      write('DAG の配置を保存', (repository) =>
        repository.putDagLayout(layout, deps.now()),
      );
    },
    start,
  };
};
