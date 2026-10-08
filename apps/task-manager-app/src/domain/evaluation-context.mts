import {
  type DomainState,
  type Milestone,
  type MilestoneId,
  type Task,
  type TaskId,
} from './types.mjs';

/**
 * The {@link DomainState} indexed by id, which is what evaluating a
 * dependency looks nodes up in. Build it once per state, not per task.
 */
export const buildEvaluationContext = ({
  tasks,
  milestones,
}: DomainState): EvaluationContext =>
  ({
    tasksById: new Map(tasks.map((task) => [task.id, task])),
    milestonesById: new Map(
      milestones.map((milestone) => [milestone.id, milestone]),
    ),
  }) as const;

export type EvaluationContext = Readonly<{
  tasksById: ReadonlyMap<TaskId, Task>;
  milestonesById: ReadonlyMap<MilestoneId, Milestone>;
}>;
