/**
 * The tasks, milestones and groups of the signed-in user, and the writes to
 * them.
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

import {
  combine,
  source as createSource,
  createState,
  filter,
  fromSubscribable,
  just,
  map,
  skipIfNoChange,
  switchMap,
  withInitialValue,
  type InitializedObservable,
  type Observable as SynstateObservable,
} from 'synstate';
import { Arr, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { DagLayout } from '../dag/index.mjs';
import {
  addDependency,
  editNodes,
  regroupNode,
  removeDependency,
  removeGroup,
  removeNodes,
  type DependencyRefusal,
  type DomainState,
  type Group,
  type GroupId,
  type Milestone,
  type NodeEdit,
  type NodeRef,
  type Task,
} from '../domain/index.mjs';
import type { ProjectSnapshot, Repository } from '../repository/index.mjs';
import type { Session } from './session-store.mjs';

export type DataStatus = 'idle' | 'loading' | 'ready';

export type ProjectLoad = 'loading' | 'loaded' | 'failed';

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
  /** The project's groups, in creation order; none while signed out. */
  groups: InitializedObservable<readonly Group[]>;
  /** The project's DAG layout; `undefined` while it has none. */
  dagLayout: InitializedObservable<DagLayout | undefined>;
  /**
   * Whether the nodes, the groups and the layout have all loaded — the
   * whole project, unlike `status`, which waits for the nodes alone — or
   * one of them failed to.
   */
  projectLoad: InitializedObservable<ProjectLoad>;
  putTask: (task: Task) => void;
  putMilestone: (milestone: Milestone) => void;
  /**
   * Deletes the nodes `refs` and every dependency on any of them, in one
   * write; writes nothing when `refs` is empty.
   */
  deleteNodes: (refs: readonly NodeRef[]) => void;
  /**
   * Makes `dependent` depend on `source` as `addDependency` says, or
   * reports why it does not.
   */
  addDependency: (dependent: NodeRef, source: NodeRef) => void;
  /**
   * Takes out every dependency of `dependent` on `source`; writes nothing
   * when there is none.
   */
  removeDependency: (dependent: NodeRef, source: NodeRef) => void;
  putGroup: (group: Group) => void;
  /** Deletes the group, and takes its nodes out of it, in one write. */
  deleteGroup: (id: GroupId) => void;
  /** Moves the node `ref` into the group `groupId`, or into none. */
  setNodeGroup: (ref: NodeRef, groupId: GroupId | undefined) => void;
  /**
   * Makes `edit` to every node `refs` names, as `editNodes` says, in one
   * write; writes nothing when nothing changes.
   */
  editNodes: (refs: readonly NodeRef[], edit: NodeEdit) => void;
  putDagLayout: (layout: DagLayout) => void;
  /**
   * Replaces `previous`, the project as it stands, with `next`, as the
   * repository's `replaceProject` says. Unlike the other writes, a failure
   * is the caller's to report: the promise rejects.
   */
  replaceProject: (
    next: ProjectSnapshot,
    previous: ProjectSnapshot,
  ) => Promise<void>;
  /** Starts following the session, and returns what stops it. */
  start: () => () => void;
}>;

export const EMPTY_STATE: DomainState = { tasks: [], milestones: [] } as const;

export const createDataStore = (deps: DataDeps): DataStore => {
  // While `start` has been called and its stop has not. What is followed is
  // derived from it, so that stopping, signing out or signing in as somebody
  // else disposes the subscriptions to the repository followed before.
  const [started, setStarted] = createState(false);

  // Once stopped, what was read is kept as it is.
  const followed = started
    .pipe(
      switchMap((isStarted): SynstateObservable<Followed> =>
        isStarted
          ? deps.session.pipe(map(repositoryOf))
          : just('stopped' as const),
      ),
    )
    .pipe(skipIfNoChange())
    .pipe(withInitialValue<Followed>('stopped'));

  /**
   * What `subscribeTo` hands `next` from the repository followed: `signedOut` while
   * nobody is signed in, and `empty` from signing in until the repository
   * hands it something.
   */
  const follow = <A,>(
    signedOut: A,
    empty: A,
    subscribeTo: (
      repository: Repository,
      next: (value: A) => void,
    ) => () => void,
  ): InitializedObservable<A> =>
    followed
      .pipe(
        switchMap((repository) =>
          repository === 'stopped'
            ? createSource<A>()
            : repository === undefined
              ? just(signedOut)
              : fromFeed(empty, (next) => subscribeTo(repository, next)),
        ),
      )
      .pipe(withInitialValue(signedOut));

  const loaded = follow<Loaded>(
    { state: EMPTY_STATE, status: 'idle', failed: false },
    { state: EMPTY_STATE, status: 'loading', failed: false },
    (repository, next) => {
      const mut_last: { loaded: Loaded } = {
        loaded: { state: EMPTY_STATE, status: 'loading', failed: false },
      };

      return repository.subscribe({
        next: (loadedState) => {
          // Once failed, a listener that is left does not make it whole.
          mut_last.loaded = {
            state: loadedState,
            status: 'ready',
            failed: mut_last.loaded.failed,
          };

          next(mut_last.loaded);
        },
        error: (error) => {
          deps.reportError(
            'データを読み込めませんでした。権限の設定か接続を確認してください。',
            error,
          );

          mut_last.loaded = { ...mut_last.loaded, failed: true };

          next(mut_last.loaded);
        },
      });
    },
  );

  const state = loaded
    .pipe(map(({ state: next }) => next))
    .pipe(skipIfNoChange());

  const dataStatus = loaded.pipe(map((current) => current.status));

  const getState = (): DomainState => state.getSnapshot().value;

  /**
   * What `subscribeTo` hands on, as `follow` does, with whether it has yet —
   * or failed, and so never will: the value then stays the last one.
   */
  const followFed = <A,>(
    empty: A,
    failure: string,
    subscribeTo: (
      repository: Repository,
      observer: Readonly<{
        next: (value: A) => void;
        error: (error: unknown) => void;
      }>,
    ) => () => void,
  ): InitializedObservable<Fed<A>> => {
    const waiting: Fed<A> = { value: empty, fed: 'waiting' } as const;

    return follow<Fed<A>>(waiting, waiting, (repository, next) => {
      const mut_last = { value: empty };

      return subscribeTo(repository, {
        next: (value) => {
          mut_last.value = value;

          next({ value, fed: 'fed' });
        },
        error: (error) => {
          deps.reportError(failure, error);

          next({ value: mut_last.value, fed: 'failed' });
        },
      });
    });
  };

  const fedLayout = followFed<DagLayout | undefined>(
    undefined,
    'DAG の配置を読み込めませんでした。',
    (repository, observer) => repository.subscribeDagLayout(observer),
  );

  // The same value again, as a failure hands it on, is no change.
  const dagLayout = fedLayout
    .pipe(map(({ value }) => value))
    .pipe(skipIfNoChange());

  const fedGroups = followFed<readonly Group[]>(
    [],
    'グループを読み込めませんでした。',
    (repository, observer) => repository.subscribeGroups(observer),
  );

  const groups = fedGroups
    .pipe(map(({ value }) => value))
    .pipe(skipIfNoChange());

  const projectLoad = combine([loaded, fedGroups, fedLayout])
    .pipe(
      map(
        ([
          { status, failed },
          { fed: groupsFed },
          { fed: layoutFed },
        ]): ProjectLoad =>
          failed || groupsFed === 'failed' || layoutFed === 'failed'
            ? 'failed'
            : status === 'ready' && groupsFed === 'fed' && layoutFed === 'fed'
              ? 'loaded'
              : 'loading',
      ),
    )
    .pipe(skipIfNoChange());

  const currentRepository = (): Repository | undefined => {
    const repository = followed.getSnapshot().value;

    return repository === 'stopped' ? undefined : repository;
  };

  const write = (
    describe: string,
    run: (repository: Repository) => Promise<void>,
  ): void => {
    const current = currentRepository();

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
    setStarted(true);

    return () => {
      setStarted(false);
    };
  };

  return {
    state,
    status: dataStatus,
    groups,
    dagLayout,
    projectLoad,
    putTask: (task) => {
      write('タスクを保存', (repository) => repository.putTask(task));
    },
    putMilestone: (milestone) => {
      write('マイルストーンを保存', (repository) =>
        repository.putMilestone(milestone),
      );
    },
    deleteNodes: (refs) => {
      if (!Arr.isNonEmpty(refs)) {
        return;
      }

      write('削除', (repository) =>
        repository.deleteNodes(refs, removeNodes(getState(), refs, deps.now())),
      );
    },
    addDependency: (dependent, source) => {
      const result = addDependency(getState(), dependent, source, deps.now());

      if (Result.isErr(result)) {
        deps.reportError(
          `依存を追加できませんでした（${refusalReasons[result.value]}）。`,
        );

        return;
      }

      const updated = result.value;

      if (updated.kind === 'task') {
        write('タスクを保存', (repository) => repository.putTask(updated.task));
      } else {
        write('マイルストーンを保存', (repository) =>
          repository.putMilestone(updated.milestone),
        );
      }
    },
    removeDependency: (dependent, source) => {
      const updated = removeDependency(
        getState(),
        dependent,
        source,
        deps.now(),
      );

      if (updated === undefined) {
        return;
      }

      if (updated.kind === 'task') {
        write('タスクを保存', (repository) => repository.putTask(updated.task));
      } else {
        write('マイルストーンを保存', (repository) =>
          repository.putMilestone(updated.milestone),
        );
      }
    },
    putGroup: (group) => {
      write('グループを保存', (repository) => repository.putGroup(group));
    },
    deleteGroup: (id) => {
      write('グループを削除', (repository) =>
        repository.deleteGroup(id, removeGroup(getState(), id, deps.now())),
      );
    },
    setNodeGroup: (ref, groupId) => {
      const regrouped = regroupNode(getState(), ref, groupId, deps.now());

      if (regrouped === undefined) {
        return;
      }

      write('グループを変更', (repository) =>
        regrouped.kind === 'task'
          ? repository.putTask(regrouped.task)
          : repository.putMilestone(regrouped.milestone),
      );
    },
    editNodes: (refs, edit) => {
      const edited = editNodes(getState(), refs, edit, deps.now());

      if (
        !Arr.isNonEmpty(edited.updatedTasks) &&
        !Arr.isNonEmpty(edited.updatedMilestones)
      ) {
        return;
      }

      write('まとめて保存', (repository) => repository.putNodes(edited));
    },
    putDagLayout: (layout) => {
      write('DAG の配置を保存', (repository) =>
        repository.putDagLayout(layout, deps.now()),
      );
    },
    replaceProject: (next, previous) => {
      const current = currentRepository();

      return current === undefined
        ? Promise.reject(new Error('Not signed in.'))
        : current.replaceProject(next, previous, deps.now());
    },
    start,
  };
};

const refusalReasons = {
  missing: 'タスクかマイルストーンが見つかりません',
  self: '自分自身には依存できません',
  duplicate: 'すでに依存しています',
  cycle: '循環する依存になります',
} as const satisfies ReadonlyRecord<DependencyRefusal, string>;

/**
 * The repository of whoever is signed in, `undefined` while nobody is, and
 * `'stopped'` while the store is not started.
 */
type Followed = Repository | undefined | 'stopped';

/** `failed` once the subscription has failed, and so stopped. */
type Loaded = Readonly<{
  state: DomainState;
  status: DataStatus;
  failed: boolean;
}>;

/** What a repository's subscription hands on, and whether it has yet. */
type Fed<A> = Readonly<{ value: A; fed: 'waiting' | 'fed' | 'failed' }>;

const repositoryOf = (session: Session): Repository | undefined =>
  session.type === 'signed-in' ? session.repository : undefined;

/**
 * What `subscribe` hands `next`, as an observable whose value is `first`
 * until then. What it hands while it is being subscribed to — the memory
 * repository hands its state at once — is the observable's initial value
 * rather than a write.
 */
const fromFeed = <A,>(
  first: A,
  subscribe: (next: (value: A) => void) => () => void,
): SynstateObservable<A> =>
  fromSubscribable<A, never>({
    subscribe: (next) => {
      next(first);

      return { unsubscribe: subscribe(next) };
    },
  })
    .pipe(filter(Result.isOk))
    .pipe(map(({ value }) => value));
