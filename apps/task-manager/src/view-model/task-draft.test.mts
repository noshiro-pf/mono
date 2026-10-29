import { Result } from 'ts-data-forge';
import {
  asGroupId,
  asMilestoneId,
  asTaskId,
  createTask,
  type Task,
} from '../domain/index.mjs';
import { applyTaskDraft, taskToDraft, type TaskDraft } from './task-draft.mjs';

const timeZone = 'Asia/Tokyo';

const task: Task = createTask({
  id: asTaskId('a'),
  title: '設計',
  now: 0,
  dueDate: 1_791_514_800_000 /* 2026-10-09T03:00:00Z */,
  labels: ['docs', 'ui'],
  estimateHours: 1.5,
  dependencies: [
    { from: { kind: 'milestone', id: asMilestoneId('m') }, lagMs: 0 },
  ],
});

const now = 50_000;

describe(taskToDraft, () => {
  test('writes the fields the way the form shows them', () => {
    assert.deepStrictEqual(taskToDraft(task, timeZone), {
      title: '設計',
      description: '',
      progress: 'not-started',
      priority: 3,
      dueDate: '2026-10-09T12:00',
      dueAllDay: false,
      labels: 'docs, ui',
      estimateHours: '1.5',
      groupId: '',
    });
  });

  test('leaves the fields of what is missing empty', () => {
    const draft = taskToDraft(
      createTask({ id: asTaskId('b'), title: 'B', now: 0 }),
      timeZone,
    );

    assert.strictEqual(draft.dueDate, '');

    assert.strictEqual(draft.estimateHours, '');
  });

  test('writes an all-day due date as its day alone', () => {
    const draft = taskToDraft(
      {
        ...task,
        dueDate: 1_791_557_999_999 /* 2026-10-09T23:59:59.999 in Tokyo */,
        dueAllDay: true,
      },
      timeZone,
    );

    assert.strictEqual(draft.dueDate, '2026-10-09');

    assert.isTrue(draft.dueAllDay);
  });
});

describe(applyTaskDraft, () => {
  test('changes nothing but updatedAt for the draft of the task itself', () => {
    assert.deepStrictEqual(
      applyTaskDraft(task, taskToDraft(task, timeZone), now, timeZone),
      Result.ok({ ...task, updatedAt: now }),
    );
  });

  test('reads every field back, and leaves the dependencies alone', () => {
    const draft: TaskDraft = {
      title: '  実装  ',
      description: '本体',
      progress: 'not-started',
      priority: 1,
      dueDate: '2026-10-10T09:30',
      dueAllDay: false,
      labels: 'a、b',
      estimateHours: ' 3 ',
      groupId: 'g',
    };

    assert.deepStrictEqual(
      applyTaskDraft(task, draft, now, timeZone),
      Result.ok({
        ...task,
        title: '実装',
        description: '本体',
        priority: 1,
        dueDate: 1_791_592_200_000 /* 2026-10-10T00:30:00Z */,
        labels: ['a', 'b'],
        estimateHours: 3,
        groupId: asGroupId('g'),
        updatedAt: now,
      }),
    );
  });

  test('reads an all-day due date as the end of its day', () => {
    const result = applyTaskDraft(
      task,
      {
        ...taskToDraft(task, timeZone),
        dueDate: '2026-10-10',
        dueAllDay: true,
      },
      now,
      timeZone,
    );

    assert.deepStrictEqual(
      Result.map(result, ({ dueDate, dueAllDay }) => ({ dueDate, dueAllDay })),
      Result.ok({
        dueDate: 1_791_644_399_999 /* 2026-10-10T23:59:59.999 in Tokyo */,
        dueAllDay: true,
      }),
    );
  });

  test('keeps an all-day due date not edited as it is, in another time zone too', () => {
    const allDay: Task = {
      ...task,
      dueDate: 1_791_557_999_999 /* 2026-10-09T23:59:59.999 in Tokyo */,
      dueAllDay: true,
    } as const;

    const laTime = 'America/Los_Angeles';

    assert.deepStrictEqual(
      applyTaskDraft(allDay, taskToDraft(allDay, laTime), now, laTime),
      Result.ok({ ...allDay, updatedAt: now }),
    );
  });

  test('is not all day without a due date', () => {
    const result = applyTaskDraft(
      task,
      { ...taskToDraft(task, timeZone), dueDate: '', dueAllDay: true },
      now,
      timeZone,
    );

    assert.deepStrictEqual(
      Result.map(result, ({ dueDate, dueAllDay }) => ({ dueDate, dueAllDay })),
      Result.ok({ dueDate: undefined, dueAllDay: false }),
    );
  });

  test('moves the progress through setProgress, which stamps the times', () => {
    const result = applyTaskDraft(
      task,
      { ...taskToDraft(task, timeZone), progress: 'done' },
      now,
      timeZone,
    );

    assert.deepStrictEqual(
      Result.map(result, ({ progress, startedAt, completedAt }) => ({
        progress,
        startedAt,
        completedAt,
      })),
      Result.ok({ progress: 'done', startedAt: now, completedAt: now }),
    );
  });

  test('clears what is emptied', () => {
    const result = applyTaskDraft(
      task,
      { ...taskToDraft(task, timeZone), dueDate: '', estimateHours: '' },
      now,
      timeZone,
    );

    assert.deepStrictEqual(
      Result.map(result, ({ dueDate, estimateHours }) => ({
        dueDate,
        estimateHours,
      })),
      Result.ok({ dueDate: undefined, estimateHours: undefined }),
    );
  });

  test('refuses a draft that is not a task, saying why', () => {
    const draft = taskToDraft(task, timeZone);

    assert.deepStrictEqual(
      applyTaskDraft(task, { ...draft, title: ' ' }, now, timeZone),
      Result.err('タイトルを入力してください。'),
    );

    assert.deepStrictEqual(
      applyTaskDraft(task, { ...draft, estimateHours: '-1' }, now, timeZone),
      Result.err('見積は 0 以上の数で入力してください。'),
    );

    assert.deepStrictEqual(
      applyTaskDraft(task, { ...draft, estimateHours: 'abc' }, now, timeZone),
      Result.err('見積は 0 以上の数で入力してください。'),
    );

    assert.deepStrictEqual(
      applyTaskDraft(
        task,
        { ...draft, dueDate: '2026-02-30T00:00' },
        now,
        timeZone,
      ),
      Result.err('期限の日時が正しくありません。'),
    );
  });
});
