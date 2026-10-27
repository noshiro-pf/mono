import { createMilestone } from './create-milestone.mjs';
import { createTask } from './create-task.mjs';
import { nextChangeAt } from './next-change-at.mjs';
import {
  asMilestoneId,
  asTaskId,
  type Dependency,
  type DomainState,
  type Milestone,
  type Task,
} from './types.mjs';

const now = 10_000;

const done = createTask({
  id: asTaskId('done'),
  title: 'Done',
  now: 0,
  progress: 'done',
  startedAt: 1000,
  completedAt: 3000,
});

const notStarted = createTask({ id: asTaskId('todo'), title: 'Todo', now: 0 });

const dependent = (dependencies: readonly Dependency[]): Task =>
  createTask({
    id: asTaskId('dependent'),
    title: 'Dependent',
    now: 0,
    dependencies,
  });

const state = (
  tasks: readonly Task[],
  milestones: readonly Milestone[] = [],
): DomainState =>
  ({ tasks: [done, notStarted, ...tasks], milestones }) as const;

describe(nextChangeAt, () => {
  test('is undefined when nothing waits on time', () => {
    assert.isUndefined(nextChangeAt(state([]), now));

    assert.isUndefined(
      nextChangeAt(
        state([
          dependent([
            {
              from: { kind: 'task', id: done.id },
              type: 'finish-to-start',
              lagMs: 0,
            },
          ]),
        ]),
        now,
      ),
    );
  });

  test('is the end of a lag after an event that has happened', () => {
    assert.strictEqual(
      nextChangeAt(
        state([
          dependent([
            {
              from: { kind: 'task', id: done.id },
              type: 'finish-to-start',
              lagMs: 10_000,
            },
            {
              from: { kind: 'task', id: done.id },
              type: 'start-to-start',
              lagMs: 9500,
            },
          ]),
        ]),
        now,
      ),
      10_500,
    );
  });

  test('ignores a lag after an event that has not happened', () => {
    assert.isUndefined(
      nextChangeAt(
        state([
          dependent([
            {
              from: { kind: 'task', id: notStarted.id },
              type: 'start-to-start',
              lagMs: 1,
            },
          ]),
        ]),
        now,
      ),
    );
  });

  test('is a future milestone date', () => {
    assert.strictEqual(
      nextChangeAt(
        state(
          [],
          [
            createMilestone({
              id: asMilestoneId('m'),
              title: 'M',
              now: 0,
              date: 15_000,
            }),
            createMilestone({
              id: asMilestoneId('p'),
              title: 'P',
              now: 0,
              date: 5000,
            }),
          ],
        ),
        now,
      ),
      15_000,
    );
  });

  test('is the end of a lag after a reached milestone, also between milestones', () => {
    const reached = createMilestone({
      id: asMilestoneId('m'),
      title: 'M',
      now: 0,
      date: 5000,
    });

    assert.strictEqual(
      nextChangeAt(
        state(
          [],
          [
            reached,
            createMilestone({
              id: asMilestoneId('n'),
              title: 'N',
              now: 0,
              dependencies: [
                { from: { kind: 'milestone', id: reached.id }, lagMs: 6000 },
              ],
            }),
          ],
        ),
        now,
      ),
      11_000,
    );
  });

  test('ignores a lag after a milestone that has not been reached', () => {
    const unreached = createMilestone({
      id: asMilestoneId('m'),
      title: 'M',
      now: 0,
      requiresManualCheck: true,
    });

    assert.isUndefined(
      nextChangeAt(
        state(
          [
            dependent([
              { from: { kind: 'milestone', id: unreached.id }, lagMs: 1 },
            ]),
          ],
          [unreached],
        ),
        now,
      ),
    );
  });

  test('is the earliest of all of them', () => {
    assert.strictEqual(
      nextChangeAt(
        state(
          [
            dependent([
              {
                from: { kind: 'task', id: done.id },
                type: 'finish-to-start',
                lagMs: 9000,
              },
            ]),
          ],
          [
            createMilestone({
              id: asMilestoneId('m'),
              title: 'M',
              now: 0,
              date: 11_000,
            }),
          ],
        ),
        now,
      ),
      11_000,
    );

    assert.strictEqual(
      nextChangeAt(
        state(
          [
            dependent([
              {
                from: { kind: 'task', id: done.id },
                type: 'finish-to-start',
                lagMs: 7500,
              },
            ]),
          ],
          [
            createMilestone({
              id: asMilestoneId('m'),
              title: 'M',
              now: 0,
              date: 11_000,
            }),
          ],
        ),
        now,
      ),
      10_500,
    );
  });
});
