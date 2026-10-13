/**
 * The nodes the graph screen leaves out — the done tasks, unless 「表示設定」
 * asks for them (`view-model/dag-show-done.mts`) — in every view mode, with
 * the edges from them: what is done is waited for by nobody, and a large
 * graph is easier to read without it. What a node shows (its status, a
 * milestone reached) is still worked out from every node.
 */

import {
  nodeId,
  type DomainState,
  type GraphNodeId,
} from '../domain/index.mjs';

/** The nodes of `state` that are not drawn, unless `showDone`. */
export const hiddenNodeIds = (
  state: DomainState,
  showDone: boolean,
): ReadonlySet<GraphNodeId> =>
  new Set(
    showDone
      ? []
      : state.tasks
          .filter(({ progress }) => progress === 'done')
          .map(({ id }) => nodeId({ kind: 'task', id })),
  );

/**
 * `state` without the nodes `hidden`, for what is drawn of it: the graph
 * laid out, the arcs. The dependencies on them are kept, and draw no edge,
 * as a dependency on a node that does not exist draws none — so this is
 * never for working out what holds, where such a dependency never would.
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
