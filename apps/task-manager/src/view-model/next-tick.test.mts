import { asMilestoneId, createMilestone } from '../domain/index.mjs';
import { nextTickDelay } from './next-tick.mjs';

const max = 60_000;

describe(nextTickDelay, () => {
  test('waits the longest when nothing will change by itself', () => {
    assert.strictEqual(
      nextTickDelay({ tasks: [], milestones: [] }, 1000, max),
      max,
    );
  });

  test('wakes when the next change is due', () => {
    const state = {
      tasks: [],
      milestones: [
        createMilestone({
          id: asMilestoneId('m'),
          title: 'M',
          now: 0,
          date: 6000,
        }),
      ],
    } as const;

    assert.strictEqual(nextTickDelay(state, 1000, max), 5000);
  });

  test('is clamped to the longest wait for a change far away', () => {
    const state = {
      tasks: [],
      milestones: [
        createMilestone({
          id: asMilestoneId('m'),
          title: 'M',
          now: 0,
          date: 10 * max,
        }),
      ],
    } as const;

    assert.strictEqual(nextTickDelay(state, 0, max), max);
  });
});
