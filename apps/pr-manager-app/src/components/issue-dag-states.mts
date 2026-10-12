/**
 * The words for where each node of the issue DAG stands: a short one for the
 * legend, and a sentence for the node's tooltip.
 */

import type { ReadonlyRecord } from 'ts-type-forge';
import type { IssueGraphNode, IssueNodeState } from '../issue-graph.mjs';

/** In the order the legend lists them: what can be done first. */
export const legendStates = [
  'free',
  'ready',
  'in-progress',
  'blocked',
  'attention',
  'cycle',
  'open',
  'done',
  'abandoned',
  'unknown',
] as const satisfies readonly IssueNodeState[];

export const stateLabels = {
  free: 'Can start',
  ready: 'Can start, wait over',
  'in-progress': 'In progress',
  blocked: 'Waiting',
  attention: 'Needs a look',
  cycle: 'Cycle',
  open: 'Open',
  done: 'Done',
  abandoned: 'Closed unfinished',
  unknown: 'Unknown',
} as const satisfies ReadonlyRecord<IssueNodeState, string>;

/** `#2225 Title — Waiting: … — Priority: high`, for the tooltip. */
export const describeNode = (node: IssueGraphNode): string =>
  [
    `#${node.number}${node.title === '' ? '' : ` ${node.title}`}`,
    `${stateLabels[node.state]}: ${explanation(node)}`,
    ...(node.priority === 'none' ? [] : [`Priority: ${node.priority}`]),
  ].join('\n');

const explanation = (node: IssueGraphNode): string => {
  switch (node.state) {
    case 'free':
      return 'it declares nothing to wait for.';

    case 'ready':
      return 'everything its Start-After: names is done.';

    case 'in-progress':
      return 'an open pull request closes it.';

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
