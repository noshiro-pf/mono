/**
 * The words for where each node of the issue DAG stands: a short one for the
 * legend, and a sentence for the node's tooltip.
 */

import type { ReadonlyRecord, StrictPick } from 'ts-type-forge';
import type { IssueGraphNode, IssueNodeState } from '../issue-graph.mjs';

/**
 * In the order the legend lists them: what can be done first. What is done is
 * not among them, since the DAG never draws it.
 */
export const legendStates = [
  'free',
  'ready',
  'planned',
  'in-progress',
  'blocked',
  'attention',
  'cycle',
  'open',
  'abandoned',
  'unknown',
] as const satisfies readonly IssueNodeState[];

export const stateLabels = {
  free: 'Can start',
  ready: 'Can start, wait over',
  planned: 'Planned',
  'in-progress': 'In progress',
  blocked: 'Waiting',
  attention: 'Needs a look',
  cycle: 'Cycle',
  open: 'Open',
  done: 'Done',
  abandoned: 'Closed unfinished',
  unknown: 'Unknown',
} as const satisfies ReadonlyRecord<IssueNodeState, string>;

/**
 * `#2225 Title — Waiting: … — Priority: high — Pending`, for the tooltip.
 * An `in-progress` or `planned` label the state does not already say — on one
 * that waits, say — is a line of its own, as `pending` is.
 */
export const describeNode = (node: IssueGraphNode): string =>
  [
    `#${node.number}${node.title === '' ? '' : ` ${node.title}`}`,
    `${stateLabels[node.state]}: ${explainState(node)}`,
    ...(node.priority === 'none' ? [] : [`Priority: ${node.priority}`]),
    ...(node.pending ? ['Labelled pending'] : []),
    ...markedNote(node),
  ].join('\n');

/**
 * `Labelled planned`, for an `in-progress` or `planned` label the state does
 * not already say, as on an issue that waits; nothing otherwise.
 */
export const markedNote = (
  node: StrictPick<IssueGraphNode, 'marked' | 'state'>,
): readonly string[] =>
  node.marked === 'none' || node.marked === node.state
    ? ([] as const)
    : ([`Labelled ${node.marked}`] as const);

/** Why a node stands where it does, in a sentence. */
export const explainState = (
  node: StrictPick<IssueGraphNode, 'kind' | 'marked' | 'state'>,
): string => {
  switch (node.state) {
    case 'free':
      return 'it declares nothing to wait for.';

    case 'ready':
      return 'everything its Start-After: names is done.';

    case 'planned':
      return 'it is labelled planned, so someone means to start it next.';

    case 'in-progress':
      return node.marked === 'in-progress'
        ? 'it is labelled in-progress, so someone has started it, whether or not a pull request closes it yet.'
        : 'an open pull request closes it.';

    case 'blocked':
      return 'something its Start-After: names is still open.';

    case 'attention':
      return 'something its Start-After: names closed without being done, or is unknown. Name what replaced it, or drop it.';

    case 'cycle':
      return 'its Start-After: leads back to itself.';

    case 'open':
      return node.kind === 'pull-request'
        ? 'an open pull request.'
        : 'an open issue past the end of the list, whose own Start-After: is not read.';

    case 'done':
      return node.kind === 'pull-request' ? 'merged.' : 'closed as completed.';

    case 'abandoned':
      return node.kind === 'pull-request'
        ? 'closed without being merged.'
        : 'closed as not planned or as a duplicate.';

    case 'unknown':
      return 'GitHub would not describe it.';
  }
};
