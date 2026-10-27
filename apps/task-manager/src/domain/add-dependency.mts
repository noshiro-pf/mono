import { Arr, Result } from 'ts-data-forge';
import { wouldCreateCycle } from './cycle.mjs';
import { nodeId } from './graph-nodes.mjs';
import type {
  Dependency,
  DomainState,
  Milestone,
  NodeRef,
  Task,
} from './types.mjs';

/**
 * Why `dependent` cannot be made to depend on `source`, or `undefined` when
 * it can: either of them is not stored, they are the same node, `dependent`
 * already depends on `source` (one edge per pair, as the dialog keeps it),
 * or the edge would close a cycle.
 */
export const dependencyRefusal = (
  state: DomainState,
  dependent: NodeRef,
  source: NodeRef,
): DependencyRefusal | undefined => {
  const dependencies = dependenciesOf(state, dependent);

  if (
    dependencies === undefined ||
    dependenciesOf(state, source) === undefined
  ) {
    return 'missing';
  }

  const sourceId = nodeId(source);

  return nodeId(dependent) === sourceId
    ? 'self'
    : dependencies.some(({ from }) => nodeId(from) === sourceId)
      ? 'duplicate'
      : wouldCreateCycle(state, dependent, source)
        ? 'cycle'
        : undefined;
};

/**
 * `dependent` as stored, made to depend on `source` at `now`: the
 * dependency it gets is the one a new row of the dialog starts as — on a
 * task, until it is done (`finish-to-start`) — with no lag, after the ones
 * it has. Refused as {@link dependencyRefusal} says.
 */
export const addDependency = (
  state: DomainState,
  dependent: NodeRef,
  source: NodeRef,
  now: number,
): Result<UpdatedNode, DependencyRefusal> => {
  const refusal = dependencyRefusal(state, dependent, source);

  if (refusal !== undefined) {
    return Result.err(refusal);
  }

  const dependency: Dependency =
    source.kind === 'task'
      ? ({ from: source, type: 'finish-to-start', lagMs: 0 } as const)
      : ({ from: source, lagMs: 0 } as const);

  const task =
    dependent.kind === 'task'
      ? state.tasks.find(({ id }) => id === dependent.id)
      : undefined;

  if (task !== undefined) {
    return Result.ok({
      kind: 'task',
      task: {
        ...task,
        dependencies: Arr.toPushed(task.dependencies, dependency),
        updatedAt: now,
      },
    });
  }

  const milestone =
    dependent.kind === 'milestone'
      ? state.milestones.find(({ id }) => id === dependent.id)
      : undefined;

  return milestone === undefined
    ? Result.err('missing')
    : Result.ok({
        kind: 'milestone',
        milestone: {
          ...milestone,
          dependencies: Arr.toPushed(milestone.dependencies, dependency),
          updatedAt: now,
        },
      });
};

export type DependencyRefusal = 'missing' | 'self' | 'duplicate' | 'cycle';

/** The node an edit changed, to be written back as it is. */
export type UpdatedNode = Readonly<
  { kind: 'task'; task: Task } | { kind: 'milestone'; milestone: Milestone }
>;

/** The dependencies of `ref` as stored; `undefined` when it is not. */
const dependenciesOf = (
  state: DomainState,
  ref: NodeRef,
): readonly Dependency[] | undefined =>
  ref.kind === 'task'
    ? state.tasks.find(({ id }) => id === ref.id)?.dependencies
    : state.milestones.find(({ id }) => id === ref.id)?.dependencies;
