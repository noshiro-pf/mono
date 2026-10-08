import { createMilestone } from './create-milestone.mjs';
import { asMilestoneId, asTaskId } from './types.mjs';

describe(createMilestone, () => {
  test('fills every field it is not given with the defaults', () => {
    assert.deepStrictEqual(
      createMilestone({ id: asMilestoneId('m'), title: 'Launch', now: 1000 }),
      {
        id: asMilestoneId('m'),
        title: 'Launch',
        description: '',
        createdAt: 1000,
        updatedAt: 1000,
        date: undefined,
        requiresManualCheck: false,
        checkedAt: undefined,
        dependencies: [],
      },
    );
  });

  test('keeps the fields it is given', () => {
    const milestone = createMilestone({
      id: asMilestoneId('m'),
      title: 'Approval',
      now: 1000,
      date: 5000,
      requiresManualCheck: true,
      dependencies: [
        {
          from: { kind: 'task', id: asTaskId('a') },
          type: 'finish-to-start',
          lagMs: 0,
        },
      ],
    });

    assert.strictEqual(milestone.date, 5000);

    assert.isTrue(milestone.requiresManualCheck);

    assert.strictEqual(milestone.dependencies.length, 1);
  });
});
