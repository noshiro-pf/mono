import { createState } from 'synstate';
import type { DagLayout } from '../dag/index.mjs';
import { asTaskId, createTask, type DomainState } from '../domain/index.mjs';
import {
  createMemoryRepository,
  type Repository,
} from '../repository/index.mjs';
import { createDataStore, EMPTY_STATE } from './data-store.mjs';
import type { Session } from './session-store.mjs';

const a = createTask({ id: asTaskId('a'), title: 'A', now: 0 });

const b = createTask({
  id: asTaskId('b'),
  title: 'B',
  now: 0,
  dependencies: [
    {
      from: { kind: 'task', id: asTaskId('a') },
      type: 'finish-to-start',
      lagMs: 0,
    },
  ],
});

const initial: DomainState = { tasks: [a, b], milestones: [] } as const;

const setup = (): Readonly<{
  store: ReturnType<typeof createDataStore>;
  setSession: (session: Session) => void;
  errors: readonly string[];
}> => {
  const [sessionState, setSession] = createState<Session>({
    type: 'starting',
  });

  const mut_errors: string[] = [];

  const store = createDataStore({
    session: sessionState,
    now: () => 1000,
    reportError: (message) => {
      mut_errors.push(message);
    },
  });

  store.start();

  return {
    store,
    setSession: (next) => {
      setSession(next);
    },
    errors: mut_errors,
  };
};

const signedIn = (repository: Repository): Session =>
  ({
    type: 'signed-in',
    userName: 'me',
    repository,
  }) as const;

describe(createDataStore, () => {
  test('is empty and idle until somebody signs in', () => {
    const { store } = setup();

    assert.deepStrictEqual(store.state.getSnapshot().value, EMPTY_STATE);

    assert.strictEqual(store.status.getSnapshot().value, 'idle');
  });

  test('loads the repository of whoever signs in', () => {
    const { store, setSession } = setup();

    setSession(signedIn(createMemoryRepository(initial)));

    assert.deepStrictEqual(store.state.getSnapshot().value, initial);

    assert.strictEqual(store.status.getSnapshot().value, 'ready');
  });

  test('writes through the repository and reads the result back', async () => {
    const { store, setSession } = setup();

    setSession(signedIn(createMemoryRepository(initial)));

    store.putTask({ ...a, title: 'A2' });

    await Promise.resolve();

    assert.strictEqual(store.state.getSnapshot().value.tasks[0]?.title, 'A2');
  });

  test('deletes a node with the dependencies on it', async () => {
    const { store, setSession } = setup();

    setSession(signedIn(createMemoryRepository(initial)));

    store.deleteNode({ kind: 'task', id: asTaskId('a') });

    await Promise.resolve();

    assert.deepStrictEqual(store.state.getSnapshot().value.tasks, [
      { ...b, dependencies: [], updatedAt: 1000 },
    ]);
  });

  test('empties the state on sign-out', () => {
    const { store, setSession } = setup();

    setSession(signedIn(createMemoryRepository(initial)));

    setSession({ type: 'signed-out', error: undefined, signingIn: false });

    assert.deepStrictEqual(store.state.getSnapshot().value, EMPTY_STATE);

    assert.strictEqual(store.status.getSnapshot().value, 'idle');
  });

  test('reports a write without a repository, and one that fails', async () => {
    const { store, setSession, errors } = setup();

    store.putTask(a);

    const failing: Repository = {
      ...createMemoryRepository(initial),
      putTask: () => Promise.reject(new Error('denied')),
    } as const;

    setSession(signedIn(failing));

    store.putTask(a);

    await Promise.resolve();

    await Promise.resolve();

    assert.deepStrictEqual(errors, [
      'タスクを保存できませんでした（サインインしていません）。',
      'タスクを保存できませんでした。',
    ]);
  });

  describe('the DAG layout', () => {
    const layout: DagLayout = {
      direction: 'down',
      positions: new Map([['task:a', { x: 1, y: 2 }]]),
    } as const;

    test('is none until somebody signs in, and that project’s after', () => {
      const { store, setSession } = setup();

      assert.isUndefined(store.dagLayout.getSnapshot().value);

      setSession(signedIn(createMemoryRepository(initial, layout)));

      assert.deepStrictEqual(store.dagLayout.getSnapshot().value, layout);

      setSession({ type: 'signed-out', error: undefined, signingIn: false });

      assert.isUndefined(store.dagLayout.getSnapshot().value);
    });

    test('is written through the repository, stamped with the time', async () => {
      const { store, setSession } = setup();

      const repository = createMemoryRepository(initial);

      const mut_writes: (readonly [DagLayout, number])[] = [];

      setSession(
        signedIn({
          ...repository,
          putDagLayout: (written, updatedAt) => {
            mut_writes.push([written, updatedAt]);

            return repository.putDagLayout(written, updatedAt);
          },
        }),
      );

      store.putDagLayout(layout);

      await Promise.resolve();

      assert.deepStrictEqual(mut_writes, [[layout, 1000]]);

      assert.deepStrictEqual(store.dagLayout.getSnapshot().value, layout);
    });

    test('reports a write that fails', async () => {
      const { store, setSession, errors } = setup();

      setSession(
        signedIn({
          ...createMemoryRepository(initial),
          putDagLayout: () => Promise.reject(new Error('denied')),
        }),
      );

      store.putDagLayout(layout);

      await Promise.resolve();

      await Promise.resolve();

      assert.deepStrictEqual(errors, ['DAG の配置を保存できませんでした。']);
    });
  });
});
