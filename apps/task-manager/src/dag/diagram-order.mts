/**
 * The order the view modes that place the tasks themselves — 「アーク」
 * (`arc-layout.mts`) and 「タイル」 (`tile-layout.mts`) — put them in. One
 * order for both, chosen in 「表示設定」 (`view-model/diagram-sort.mts`),
 * and sorted as the list sorts (`taskSortContext`), so that the two agree.
 * The store holds it (`dag-layout-store.mts`, `diagramSort`).
 */

import {
  nodeId,
  sortTasks,
  taskSortContext,
  type DomainState,
  type GraphNodeId,
  type SortSpec,
} from '../domain/index.mjs';
import { effectiveDiagramSort } from '../view-model/index.mjs';

/**
 * Every task of `state`, and no milestone, sorted by `sort` — by title
 * ascending for no keys — with the status each has at `now`.
 */
export const diagramTaskIds = (
  state: DomainState,
  sort: readonly SortSpec[],
  now: number,
): readonly GraphNodeId[] =>
  sortTasks(
    state.tasks,
    effectiveDiagramSort(sort),
    taskSortContext(state, now),
  ).map(({ id }) => nodeId({ kind: 'task', id }));

/** Whether `a` and `b` are the same ids in the same order. */
export const sameDiagramOrder = (
  a: readonly GraphNodeId[],
  b: readonly GraphNodeId[],
): boolean => a.length === b.length && a.every((id, index) => id === b[index]);
