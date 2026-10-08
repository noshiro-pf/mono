import { createMilestone } from './create-milestone.mjs';
import { createTask } from './create-task.mjs';
import { buildEvaluationContext } from './evaluation-context.mjs';
import { asMilestoneId, asTaskId } from './types.mjs';

describe(buildEvaluationContext, () => {
  test('indexes tasks and milestones by id', () => {
    const a = createTask({ id: asTaskId('a'), title: 'A', now: 0 });

    const b = createTask({ id: asTaskId('b'), title: 'B', now: 0 });

    const m = createMilestone({ id: asMilestoneId('m'), title: 'M', now: 0 });

    const { tasksById, milestonesById } = buildEvaluationContext({
      tasks: [a, b],
      milestones: [m],
    });

    assert.deepStrictEqual(Array.from(tasksById.keys()), [a.id, b.id]);

    assert.strictEqual(tasksById.get(b.id), b);

    assert.strictEqual(milestonesById.get(m.id), m);
  });
});
