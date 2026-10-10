/**
 * What the in-memory demo starts with: a small release plan with a bit of
 * everything — a chain of finish-to-start dependencies, a start-to-start one
 * with a lag, a date gate, a milestone that needs a manual check, a task in
 * review and one done.
 */

import {
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type DomainState,
} from '../domain/index.mjs';

const HOUR_MS = 3_600_000;

const DAY_MS = 86_400_000;

export const sampleState = (now: number): DomainState => {
  const ids = {
    spec: asTaskId('spec'),
    design: asTaskId('design'),
    api: asTaskId('api'),
    ui: asTaskId('ui'),
    docs: asTaskId('docs'),
    test: asTaskId('test'),
    review: asMilestoneId('review'),
    release: asMilestoneId('release'),
    freeze: asMilestoneId('freeze'),
  } as const;

  const created = now - 7 * DAY_MS;

  return {
    tasks: [
      createTask({
        id: ids.spec,
        title: '仕様をまとめる',
        now: created,
        progress: 'done',
        priority: 1,
        startedAt: created + HOUR_MS,
        completedAt: now - 3 * DAY_MS,
        labels: ['企画'],
        estimateHours: 4,
      }),
      createTask({
        id: ids.design,
        title: '画面設計',
        now: created + 1,
        progress: 'in-review',
        priority: 2,
        startedAt: now - 2 * DAY_MS,
        dueDate: now + DAY_MS,
        labels: ['UI', '設計'],
        estimateHours: 6,
        dependencies: [
          {
            from: { kind: 'task', id: ids.spec },
            type: 'finish-to-start',
            lagMs: 0,
          },
        ],
      }),
      createTask({
        id: ids.api,
        title: 'API を実装する',
        now: created + 2,
        progress: 'in-progress',
        priority: 1,
        startedAt: now - DAY_MS,
        dueDate: now - HOUR_MS,
        labels: ['実装'],
        estimateHours: 12,
        dependencies: [
          {
            from: { kind: 'task', id: ids.spec },
            type: 'finish-to-start',
            lagMs: 0,
          },
        ],
      }),
      createTask({
        id: ids.ui,
        title: '画面を実装する',
        now: created + 3,
        priority: 2,
        dueDate: now + 5 * DAY_MS,
        labels: ['実装', 'UI'],
        estimateHours: 16,
        dependencies: [
          {
            from: { kind: 'task', id: ids.design },
            type: 'finish-to-start',
            lagMs: 0,
          },
          {
            from: { kind: 'task', id: ids.api },
            type: 'start-to-start',
            lagMs: 3 * DAY_MS,
          },
        ],
      }),
      createTask({
        id: ids.docs,
        title: '利用者向けドキュメントを書く',
        now: created + 4,
        priority: 4,
        labels: ['ドキュメント'],
        estimateHours: 3,
        dependencies: [
          {
            from: { kind: 'task', id: ids.spec },
            type: 'finish-to-start',
            lagMs: 0,
          },
        ],
      }),
      createTask({
        id: ids.test,
        title: '結合テスト',
        now: created + 5,
        priority: 3,
        dueDate: now + 8 * DAY_MS,
        estimateHours: 8,
        dependencies: [
          { from: { kind: 'milestone', id: ids.review }, lagMs: 0 },
        ],
      }),
    ],
    milestones: [
      createMilestone({
        id: ids.review,
        title: '実装完了',
        now: created + 6,
        dependencies: [
          {
            from: { kind: 'task', id: ids.ui },
            type: 'finish-to-start',
            lagMs: 0,
          },
          {
            from: { kind: 'task', id: ids.api },
            type: 'finish-to-start',
            lagMs: 0,
          },
        ],
      }),
      createMilestone({
        id: ids.freeze,
        title: 'コードフリーズ',
        now: created + 7,
        date: now + 10 * DAY_MS,
      }),
      createMilestone({
        id: ids.release,
        title: 'リリース承認',
        now: created + 8,
        requiresManualCheck: true,
        dependencies: [
          {
            from: { kind: 'task', id: ids.test },
            type: 'finish-to-start',
            lagMs: 0,
          },
          { from: { kind: 'milestone', id: ids.freeze }, lagMs: 0 },
        ],
      }),
    ],
  };
};
