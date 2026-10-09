import { createState } from 'synstate';
import {
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type DomainState,
  type Milestone,
  type NodeRef,
  type Task,
} from '../domain/index.mjs';
import { DAY_MS, HOUR_MS, type DependencyRow } from '../view-model/index.mjs';
import {
  createEditorStore,
  type EditorState,
  type EditorStore,
} from './editor-store.mjs';

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

const m = createMilestone({
  id: asMilestoneId('m'),
  title: 'M',
  now: 0,
  requiresManualCheck: true,
});

const initial: DomainState = { tasks: [a, b], milestones: [m] } as const;

const now = 10_000;

type Setup = Readonly<{
  store: EditorStore;
  setState: (next: DomainState) => void;
  putTasks: readonly Task[];
  putMilestones: readonly Milestone[];
  deleted: readonly NodeRef[];
}>;

const setup = (): Setup => {
  const [state, setState] = createState(initial);

  const mut_putTasks: Task[] = [];

  const mut_putMilestones: Milestone[] = [];

  const mut_deleted: NodeRef[] = [];

  const store = createEditorStore({
    state,
    now: () => now,
    newId: () => 'new',
    timeZone: 'UTC',
    putTask: (task) => {
      mut_putTasks.push(task);
    },
    putMilestone: (milestone) => {
      mut_putMilestones.push(milestone);
    },
    deleteNode: (ref) => {
      mut_deleted.push(ref);
    },
  });

  return {
    store,
    setState: (next) => {
      setState(next);
    },
    putTasks: mut_putTasks,
    putMilestones: mut_putMilestones,
    deleted: mut_deleted,
  };
};

const editorOf = ({ store }: Setup): EditorState =>
  store.editor.getSnapshot().value;

const rowsOf = (setupped: Setup): readonly DependencyRow[] => {
  const current = editorOf(setupped);

  return current.type === 'closed' ? [] : current.rows;
};

const EMPTY_ROW_1: DependencyRow = {
  key: 1,
  source: '',
  type: 'finish-to-start',
  lagDays: '0',
  lagHours: '0',
} as const;

describe(createEditorStore, () => {
  test('opens a stored node with its draft, and closes', () => {
    const setupped = setup();

    setupped.store.open({ kind: 'task', id: asTaskId('a') });

    const opened = editorOf(setupped);

    assert.strictEqual(opened.type, 'task');

    assert.strictEqual(opened.type === 'task' ? opened.draft.title : '', 'A');

    setupped.store.close();

    assert.strictEqual(editorOf(setupped).type, 'closed');
  });

  test('does not open a node that is not stored', () => {
    const setupped = setup();

    setupped.store.open({ kind: 'task', id: asTaskId('gone') });

    assert.strictEqual(editorOf(setupped).type, 'closed');
  });

  test('creates a task with a fresh id, and saves it', () => {
    const setupped = setup();

    setupped.store.createTask();

    setupped.store.updateTaskDraft({ title: '新しいタスク' });

    setupped.store.save();

    assert.deepStrictEqual(setupped.putTasks, [
      createTask({
        id: asTaskId('new'),
        title: '新しいタスク',
        now,
      }),
    ]);

    assert.strictEqual(editorOf(setupped).type, 'closed');
  });

  test('keeps the dialog open with the reason when saving is refused', () => {
    const setupped = setup();

    setupped.store.createMilestone();

    setupped.store.save();

    const current = editorOf(setupped);

    assert.strictEqual(
      current.type === 'milestone' ? current.error : undefined,
      'タイトルを入力してください。',
    );

    assert.deepStrictEqual(setupped.putMilestones, []);
  });

  test('saves onto the node as stored now, keeping what changed elsewhere', () => {
    const setupped = setup();

    setupped.store.open({ kind: 'task', id: asTaskId('a') });

    setupped.setState({
      ...initial,
      tasks: [{ ...a, assignees: ['someone'] }, b],
    });

    setupped.store.updateTaskDraft({ progress: 'in-progress' });

    setupped.store.save();

    assert.deepStrictEqual(setupped.putTasks, [
      {
        ...a,
        assignees: ['someone'],
        progress: 'in-progress',
        startedAt: now,
        updatedAt: now,
      },
    ]);
  });

  test('opens with a row per dependency, and an empty one to fill in', () => {
    const setupped = setup();

    setupped.store.open({ kind: 'task', id: asTaskId('b') });

    assert.deepStrictEqual(rowsOf(setupped), [
      {
        key: 0,
        source: 'task:a',
        type: 'finish-to-start',
        lagDays: '0',
        lagHours: '0',
      },
      EMPTY_ROW_1,
    ]);
  });

  test('saves what is typed into a row, without adding it first', () => {
    const setupped = setup();

    setupped.store.open({ kind: 'task', id: asTaskId('a') });

    setupped.store.updateDependencyRow(0, {
      source: 'milestone:m',
      lagDays: '1',
      lagHours: '2',
    });

    setupped.store.save();

    assert.deepStrictEqual(
      setupped.putTasks.map(({ dependencies }) => dependencies),
      [
        [
          {
            from: { kind: 'milestone', id: m.id },
            lagMs: DAY_MS + 2 * HOUR_MS,
          },
        ],
      ],
    );

    assert.strictEqual(editorOf(setupped).type, 'closed');
  });

  test('adds an empty row, which saving leaves out', () => {
    const setupped = setup();

    setupped.store.open({ kind: 'task', id: asTaskId('b') });

    setupped.store.addDependencyRow();

    assert.deepStrictEqual(
      rowsOf(setupped).map(({ key, source }) => ({ key, source })),
      [
        { key: 0, source: 'task:a' },
        { key: 1, source: '' },
        { key: 2, source: '' },
      ],
    );

    setupped.store.save();

    assert.deepStrictEqual(
      setupped.putTasks.map(({ dependencies }) => dependencies),
      [b.dependencies],
    );
  });

  test('refuses to save while a row is wrong, and writes nothing', () => {
    const setupped = setup();

    setupped.store.open({ kind: 'task', id: asTaskId('a') });

    setupped.store.updateDependencyRow(0, {
      source: 'task:b',
      type: 'start-to-start',
    });

    setupped.store.save();

    assert.deepStrictEqual(setupped.putTasks, []);

    const current = editorOf(setupped);

    assert.strictEqual(current.type, 'task');

    assert.isUndefined(current.type === 'task' ? current.error : '');

    assert.strictEqual(rowsOf(setupped)[0]?.source, 'task:b');
  });

  test('removes a dependency by removing its row', () => {
    const setupped = setup();

    setupped.store.open({ kind: 'task', id: asTaskId('b') });

    setupped.store.removeDependencyRow(0);

    assert.deepStrictEqual(rowsOf(setupped), [EMPTY_ROW_1]);

    setupped.store.save();

    assert.deepStrictEqual(
      setupped.putTasks.map(({ dependencies }) => dependencies),
      [[]],
    );
  });

  test('saves a milestone’s rows too', () => {
    const setupped = setup();

    setupped.store.open({ kind: 'milestone', id: asMilestoneId('m') });

    setupped.store.updateDependencyRow(0, {
      source: 'task:b',
      type: 'start-to-start',
    });

    setupped.store.save();

    assert.deepStrictEqual(
      setupped.putMilestones.map(({ dependencies }) => dependencies),
      [
        [
          {
            from: { kind: 'task', id: asTaskId('b') },
            type: 'start-to-start',
            lagMs: 0,
          },
        ],
      ],
    );
  });

  test('resolves and reopens a manual check', () => {
    const setupped = setup();

    setupped.store.open({ kind: 'milestone', id: asMilestoneId('m') });

    setupped.store.check();

    const checked = editorOf(setupped);

    assert.strictEqual(
      checked.type === 'milestone' ? checked.draft.checkedAt : undefined,
      now,
    );

    setupped.store.uncheck();

    const unchecked = editorOf(setupped);

    assert.isUndefined(
      unchecked.type === 'milestone' ? unchecked.draft.checkedAt : 0,
    );
  });

  test('deletes only once confirmed', () => {
    const setupped = setup();

    setupped.store.open({ kind: 'task', id: asTaskId('a') });

    setupped.store.requestDelete();

    setupped.store.cancelDelete();

    assert.deepStrictEqual(setupped.deleted, []);

    setupped.store.requestDelete();

    setupped.store.confirmDelete();

    assert.deepStrictEqual(setupped.deleted, [
      { kind: 'task', id: asTaskId('a') },
    ]);

    assert.strictEqual(editorOf(setupped).type, 'closed');
  });

  test('discarding a node never stored writes nothing', () => {
    const setupped = setup();

    setupped.store.createTask();

    setupped.store.requestDelete();

    setupped.store.confirmDelete();

    assert.deepStrictEqual(setupped.deleted, []);
  });
});
