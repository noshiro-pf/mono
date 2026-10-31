/**
 * The nodes the graph screen leaves out — the done tasks and the reached
 * milestones, unless 「表示設定」 asks for them (`view-model/dag-show-done.mts`)
 * — in every view mode, with the edges from them: what is done or reached is
 * waited for by nobody, and a large graph is easier to read without it. What a
 * node shows (its status, a milestone reached) is still worked out from every
 * node.
 *
 * A milestone with nothing to wait for — no date, no manual check, no
 * dependency, as one is made — is reached when it is created, and stays: it is
 * a node about to be given its conditions, not one past them.
 */

import { Arr } from 'ts-data-forge';
import {
  buildEvaluationContext,
  createEvaluator,
  nodeId,
  type DomainState,
  type GraphNodeId,
  type Milestone,
} from '../domain/index.mjs';

/** The nodes of `state` that are not drawn at `now`, unless `showDone`. */
export const hiddenNodeIds = (
  state: DomainState,
  now: number,
  showDone: boolean,
): ReadonlySet<GraphNodeId> => {
  if (showDone) {
    return new Set<GraphNodeId>();
  }

  const evaluator = createEvaluator(buildEvaluationContext(state), now);

  return new Set(
    Arr.concat(
      state.tasks
        .filter(({ progress }) => progress === 'done')
        .map(({ id }) => nodeId({ kind: 'task', id })),
      state.milestones
        .filter(
          (milestone) =>
            hasCondition(milestone) &&
            evaluator.milestoneReachedAt(milestone) !== undefined,
        )
        .map(({ id }) => nodeId({ kind: 'milestone', id })),
    ),
  );
};

/**
 * Whether `a` and `b` hold the same nodes — what `hiddenNodeIds` gives again at
 * every tick of the clock, that needs nothing laid out again.
 */
export const sameNodeIds = (
  a: ReadonlySet<GraphNodeId>,
  b: ReadonlySet<GraphNodeId>,
): boolean => a.size === b.size && Array.from(a).every((id) => b.has(id));

/**
 * `state` without the nodes `hidden`, for what is drawn of it: the graph laid
 * out, the arcs. The dependencies on them are kept, and draw no edge, as a
 * dependency on a node that does not exist draws none — so this is never for
 * working out what holds, where such a dependency never would.
 */
export const withoutNodes = (
  state: DomainState,
  hidden: ReadonlySet<GraphNodeId>,
): DomainState =>
  hidden.size === 0
    ? state
    : ({
        tasks: state.tasks.filter(
          ({ id }) => !hidden.has(nodeId({ kind: 'task', id })),
        ),
        milestones: state.milestones.filter(
          ({ id }) => !hidden.has(nodeId({ kind: 'milestone', id })),
        ),
      } as const);

const hasCondition = (milestone: Milestone): boolean =>
  milestone.date !== undefined ||
  milestone.requiresManualCheck ||
  Arr.isNonEmpty(milestone.dependencies);
