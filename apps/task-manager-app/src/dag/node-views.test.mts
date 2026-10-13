import {
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type DomainState,
} from '../domain/index.mjs';
import { DAY_MS } from '../view-model/index.mjs';
import { buildNodeViews } from './node-views.mjs';
import { textWidthUnits } from './truncate.mjs';

const a = asTaskId('a');

const b = asTaskId('b');

const m = asMilestoneId('m');

const state: DomainState = {
  tasks: [
    createTask({
      id: a,
      title: 'とても長いタイトルのタスクで切り詰められる',
      now: 0,
    }),
    createTask({
      id: b,
      title: 'B',
      now: 0,
      priority: 1,
      dueDate: 1_791_515_100_000 /* 2026-10-09T03:05:00Z */,
      progress: 'in-progress',
      startedAt: 10,
      dependencies: [{ from: { kind: 'milestone', id: m }, lagMs: 0 }],
    }),
  ],
  milestones: [
    createMilestone({
      id: m,
      title: 'M',
      now: 0,
      requiresManualCheck: true,
    }),
  ],
} as const;

describe(buildNodeViews, () => {
  test('has a view per node, keyed by its graph id', () => {
    const views = buildNodeViews(state, 100);

    assert.deepStrictEqual(Array.from(views.keys()), [
      'task:a',
      'task:b',
      'milestone:m',
    ]);
  });

  test('describes a task by its status, due date, priority and warning', () => {
    const view = buildNodeViews(state, 100, 'Asia/Tokyo').get('task:b');

    assert.deepStrictEqual(view, {
      kind: 'task',
      ref: { kind: 'task', id: b },
      title: 'B',
      shortTitle: 'B',
      compactTitle: 'B',
      status: 'in-progress',
      priority: 1,
      due: '期限 2026/10/09',
      overdue: false,
      warning: true,
      ariaLabel:
        'タスク「B」 状態: 作業中 期限: 2026/10/09 12:05 優先度: 最高 依存が未解消のまま開始',
    });
  });

  test('writes the due date short, and marks it once it has passed', () => {
    const dueDate = 1_791_515_100_000; /* 2026-10-09T03:05:00Z */

    const before = buildNodeViews(state, dueDate - DAY_MS, 'Asia/Tokyo').get(
      'task:b',
    );

    assert.isTrue(before?.kind === 'task');

    assert.strictEqual(before.due, '期限 10/09 12:05');

    assert.isFalse(before.overdue);

    const after = buildNodeViews(state, dueDate + 1, 'Asia/Tokyo').get(
      'task:b',
    );

    assert.isTrue(after?.kind === 'task');

    assert.strictEqual(after.due, '期限切れ 10/09 12:05');

    assert.isTrue(after.overdue);

    assert.isTrue(after.ariaLabel.includes(' 期限切れ '));
  });

  test('says so when a task has no due date, and never marks a done one', () => {
    const view = buildNodeViews(state, 100).get('task:a');

    assert.isTrue(view?.kind === 'task');

    assert.strictEqual(view.due, '期限なし');

    assert.isFalse(view.ariaLabel.includes('期限'));

    const done = buildNodeViews(
      {
        ...state,
        tasks: state.tasks.map((task) => ({
          ...task,
          progress: 'done',
          startedAt: 10,
          completedAt: 20,
        })),
      },
      1_791_515_100_000 + DAY_MS,
    ).get('task:b');

    assert.isTrue(done?.kind === 'task');

    assert.isFalse(done.overdue);

    assert.isTrue(done.due.startsWith('期限 '));
  });

  test('cuts a long title to fit the node', () => {
    const view = buildNodeViews(state, 100).get('task:a');

    assert.strictEqual(view?.shortTitle.endsWith('…'), true);

    assert.isBelow(
      view?.shortTitle.length ?? Number.POSITIVE_INFINITY,
      view?.title.length ?? 0,
    );
  });

  test('cuts it shorter for a compact node', () => {
    const view = buildNodeViews(state, 100).get('task:a');

    assert.isDefined(view);

    assert.isTrue(view.compactTitle.endsWith('…'));

    assert.isBelow(
      textWidthUnits(view.compactTitle),
      textWidthUnits(view.shortTitle),
    );
  });

  test('leaves room for the warning on a compact task, and for the check box on a compact milestone', () => {
    const long = 'あいうえおかきくけこさしすせそ';

    const views = buildNodeViews(
      {
        tasks: state.tasks.map((task) => ({ ...task, title: long })),
        milestones: state.milestones.map((milestone) => ({
          ...milestone,
          title: long,
        })),
      },
      100,
    );

    const plain = views.get('task:a');

    const warned = views.get('task:b');

    const awaiting = views.get('milestone:m');

    assert.isDefined(plain);

    assert.isFalse(plain.kind === 'task' && plain.warning);

    assert.isTrue(warned?.kind === 'task' && warned.warning);

    assert.isBelow(
      textWidthUnits(warned.compactTitle),
      textWidthUnits(plain.compactTitle),
    );

    assert.isTrue(awaiting?.kind === 'milestone' && awaiting.awaitingCheck);

    assert.isBelow(
      textWidthUnits(awaiting.compactTitle),
      textWidthUnits(plain.compactTitle),
    );
  });

  test('describes a milestone by whether it is reached', () => {
    assert.deepStrictEqual(buildNodeViews(state, 100).get('milestone:m'), {
      kind: 'milestone',
      ref: { kind: 'milestone', id: m },
      title: 'M',
      shortTitle: 'M',
      compactTitle: 'M',
      reached: false,
      awaitingCheck: true,
      ariaLabel: 'マイルストーン「M」 未到達 解消待ち',
    });
  });
});
