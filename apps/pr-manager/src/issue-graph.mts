/**
 * The open issues as a graph of what each waits for, read from their
 * `Start-After:` declarations (`docs/issue-start-after.md`), for the issues
 * block's DAG.
 *
 * The nodes are every listed issue, everything their declarations name, and
 * the open pull requests that close a listed issue. An edge runs from what is
 * waited for to what waits — a `Start-After:` — or from an issue to a pull
 * request that closes it, which is the work on that issue under way. How an
 * issue stands is `pr-report-core`'s `decideStartStates`; this adds where
 * everything else stands, how far someone has got with a startable issue, and
 * the `priority:*` label of what the page read the labels of, whether it is
 * labelled `pending`, and whether `in-progress` or `planned`.
 */

import {
  decideStartStates,
  progressOf,
  withProgress,
  type IssueProgress,
  type IssueStartState,
} from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { isIssueFilterShown, type IssueFilter } from './issue-filter.mjs';
import type { Entry, IssueItem, ReferencedItem } from './load-report.mjs';
import { isPending } from './pending.mjs';
import { priorityOf, type Priority } from './priority.mjs';

/**
 * How a node is drawn.
 *
 * A listed issue takes its {@link IssueStartState}: its start state, or
 * `in-progress` or `planned` when it is startable and an open pull request
 * closes it or its labels say so (`pr-report-core`'s `withProgress`). Anything else is where it
 * stands: `open` for an open pull request, and for an open issue past the end
 * of the list, whose own declarations were not read; `done`, `abandoned` or
 * `unknown` for the rest, as `ReferenceStatus` says.
 */
export type IssueNodeState =
  IssueStartState | 'abandoned' | 'done' | 'open' | 'unknown';

export type IssueGraphNode = Readonly<{
  number: number;
  kind: 'issue' | 'pull-request';
  /** Empty for a number GitHub would not describe. */
  title: string;
  url: string;
  state: IssueNodeState;
  /**
   * The one `priority:*` label it carries. Only a listed issue and an open
   * pull request have their labels read; anything else is `none`.
   */
  priority: Priority;
  /**
   * Whether it is labelled `pending`, which its author puts on what is held
   * back for now; read where the priority is, and `false` elsewhere.
   */
  pending: boolean;
  /**
   * What its `in-progress` or `planned` label says
   * (`pr-report-core`'s `progressOf`, with no pull request), read where the
   * priority is and `none` elsewhere: the state shows it only when the issue
   * is startable, and the tooltip says it whatever the state.
   */
  marked: IssueProgress;
}>;

export type IssueGraphEdge = Readonly<{
  from: number;
  to: number;
  /**
   * `start-after` from what is waited for to the issue waiting; `closes`
   * from an issue to a pull request that closes it.
   */
  kind: 'closes' | 'start-after';
}>;

export type IssueGraph = Readonly<{
  /** Lowest number first. */
  nodes: readonly IssueGraphNode[];
  edges: readonly IssueGraphEdge[];
}>;

export type OpenPullRequestFacts = StrictPick<
  Entry,
  'labels' | 'linkedIssues' | 'number' | 'title' | 'url'
>;

export const buildIssueGraph = ({
  repoUrl,
  issues,
  referenced,
  pulls,
}: Readonly<{
  /** `https://github.com/owner/name`, for a number nobody described. */
  repoUrl: string;
  issues: readonly IssueItem[];
  referenced: readonly ReferencedItem[];
  pulls: readonly OpenPullRequestFacts[];
}>): IssueGraph => {
  const listed = new Set(issues.map(({ number }) => number));

  const pullByNumber = new Map(pulls.map((pull) => [pull.number, pull]));

  const referencedByNumber = new Map(
    referenced.map((item) => [item.number, item]),
  );

  const startStates = decideStartStates(issues, (number) =>
    pullByNumber.has(number)
      ? 'waiting'
      : (referencedByNumber.get(number)?.status ?? 'unknown'),
  );

  // The open pull requests that close a listed issue, and so the work on it.
  const closing = pulls.flatMap((pull) =>
    pull.linkedIssues
      .filter(({ number }) => listed.has(number))
      .map(({ number }) => ({ issue: number, pull: pull.number })),
  );

  const worked = new Set(closing.map(({ issue }) => issue));

  const issueNodes = issues.map((issue): IssueGraphNode => {
    const state = startStates.get(issue.number) ?? 'free';

    const marked = progressOf(issue.labels, false);

    return {
      number: issue.number,
      kind: 'issue',
      title: issue.title,
      url: issue.url,
      state: withProgress(
        state,
        worked.has(issue.number) ? 'in-progress' : marked,
      ),
      priority: priorityOf(issue.labels),
      pending: isPending(issue.labels),
      marked,
    };
  });

  const named = issues.flatMap(({ startAfter }) =>
    startAfter.filter((number) => !listed.has(number)),
  );

  const others = [...named, ...closing.map(({ pull }) => pull)] as const;

  const otherNodes = Array.from(new Set(others), (number): IssueGraphNode => {
    const pull = pullByNumber.get(number);

    if (pull !== undefined) {
      return {
        number,
        kind: 'pull-request',
        title: pull.title,
        url: pull.url,
        state: 'open',
        priority: priorityOf(pull.labels),
        pending: isPending(pull.labels),
        marked: 'none',
      };
    }

    const item = referencedByNumber.get(number);

    return item === undefined
      ? {
          number,
          kind: 'issue',
          title: '',
          url: `${repoUrl}/issues/${number}`,
          state: 'unknown',
          priority: 'none',
          pending: false,
          marked: 'none',
        }
      : {
          number,
          kind: item.kind,
          title: item.title,
          url: item.url,
          state: item.status === 'waiting' ? 'open' : item.status,
          priority: 'none',
          pending: false,
          marked: 'none',
        };
  });

  const nodes = [...issueNodes, ...otherNodes].toSorted(
    (a, b) => a.number - b.number,
  );

  const edges: readonly IssueGraphEdge[] = [
    ...issues.flatMap(({ number, startAfter }) =>
      startAfter.map((from): IssueGraphEdge => ({
        from,
        to: number,
        kind: 'start-after',
      })),
    ),
    ...closing.map(({ issue, pull }): IssueGraphEdge => ({
      from: issue,
      to: pull,
      kind: 'closes',
    })),
  ] as const;

  return { nodes, edges };
};

/** How a listed issue stands for being started, as its row says it. */
export type IssueStart = Readonly<{
  state: IssueStartState;
  /** What its `in-progress` or `planned` label says, as its node has it. */
  marked: IssueProgress;
  /** What its `Start-After:` names, as the graph draws each, in its order. */
  named: readonly IssueGraphNode[];
}>;

/**
 * Each listed issue's {@link IssueStart}, read off the whole graph — what
 * is done included, since that is why an issue reads as ready.
 */
export const issueStartsOf = (
  graph: IssueGraph,
  issues: readonly IssueItem[],
): ReadonlyMap<number, IssueStart> => {
  const byNumber = new Map(graph.nodes.map((node) => [node.number, node]));

  return new Map(
    Arr.generate(function* () {
      for (const { number, startAfter } of issues) {
        const listed = byNumber.get(number);

        if (listed !== undefined && isIssueStartState(listed.state)) {
          yield [
            number,
            {
              state: listed.state,
              marked: listed.marked,
              named: Arr.generate(function* () {
                for (const each of startAfter) {
                  const node = byNumber.get(each);

                  if (node !== undefined) {
                    yield node;
                  }
                }
              }),
            },
          ] as const;
        }
      }
    }),
  );
};

/**
 * Whether the node is a listed issue — an open issue the page read, whose
 * priority it knows — rather than what one names or what closes one.
 */
export const isListedIssue = (node: IssueGraphNode): boolean =>
  isIssueStartState(node.state);

/** Whether a node's state is a listed issue's rather than where it stands. */
const isIssueStartState = (state: IssueNodeState): state is IssueStartState =>
  state !== 'abandoned' &&
  state !== 'done' &&
  state !== 'open' &&
  state !== 'unknown';

/**
 * The graph without what is done — closed as completed, or merged — and
 * without the edges that run from it, which are the waits already over.
 *
 * What closed unfinished stays: the issue waiting on it needs a look, and
 * the node is why. The graph given is handed back when nothing in it is
 * done, so a graph that is not changed by this is not laid out again.
 */
export const omitDone = (graph: IssueGraph): IssueGraph =>
  omitNodes(graph, ({ state }) => state === 'done');

/**
 * The graph without what is labelled `pending`, the edges that run from it
 * or to it, and what is left with no edge for it (see {@link omitNodes}).
 * How the rest stands is left as it was: an issue waiting on one still
 * waits, which its tooltip says. The graph given is handed back when
 * nothing in it is pending.
 */
export const omitPending = (graph: IssueGraph): IssueGraph =>
  omitNodes(graph, ({ pending }) => pending);

/**
 * The graph without the listed issues `filter` leaves out by their priority
 * or by whether they are pending (`issue-filter.mts`, which the list reads
 * the same one from), save those an issue left in waits on, and without
 * what is left with no edge for them (see {@link omitNodes}).
 *
 * An issue left out that one left in waits on is kept, as what that one waits
 * on is kept when it is not a listed issue: it is why that issue waits. It is
 * drawn without what it waits on in turn or the pull requests that close it,
 * save what is drawn for another, since it is there for the other's sake, and
 * it is not counted among the issues shown (`countIssueFilter`). Only a
 * listed issue is left out by `filter`, since nothing else here has its labels
 * read for a reason of its own; what is pending is taken out whatever it is by
 * {@link omitPending}, while it is switched off. The graph given is handed back
 * when `filter` leaves out no listed issue.
 */
export const omitFilteredIssues = (
  graph: IssueGraph,
  filter: IssueFilter,
): IssueGraph => {
  const filtered = new Set(
    graph.nodes
      .filter(
        (node) =>
          isListedIssue(node) &&
          !isIssueFilterShown(node.priority, node.pending, filter),
      )
      .map(({ number }) => number),
  );

  if (filtered.size === 0) {
    return graph;
  }

  // What an issue left in waits on.
  const kept = new Set(
    graph.edges
      .filter(
        ({ from, to, kind }) =>
          kind === 'start-after' && filtered.has(from) && !filtered.has(to),
      )
      .map(({ from }) => from),
  );

  const gone = new Set(
    Array.from(filtered).filter((number) => !kept.has(number)),
  );

  // What is not a listed issue is drawn for an issue drawn for its own
  // sake: one that waits on it, or one it closes. A kept issue brings
  // nothing of its own.
  const anchored = new Set(
    graph.edges.flatMap(({ from, to, kind }) =>
      kind === 'start-after'
        ? filtered.has(to)
          ? []
          : [from]
        : filtered.has(from)
          ? []
          : [to],
    ),
  );

  const drawn = new Set(
    graph.nodes
      .filter(({ number }) => !gone.has(number))
      .filter((node) => isListedIssue(node) || anchored.has(node.number))
      .map(({ number }) => number),
  );

  // Between what is drawn, every edge stays.
  return {
    nodes: graph.nodes.filter(({ number }) => drawn.has(number)),
    edges: graph.edges.filter(
      ({ from, to }) => drawn.has(from) && drawn.has(to),
    ),
  };
};

/**
 * The graph without what `omitted` says, the edges that run from it or to
 * it, and what is not a listed issue and is left with no edge: what only
 * the nodes taken out name, and an open pull request that closes only
 * them. Such a node is drawn only for the issues it is linked to. The graph
 * given is handed back when nothing is taken out.
 */
const omitNodes = (
  graph: IssueGraph,
  omitted: (node: IssueGraphNode) => boolean,
): IssueGraph => {
  const gone = new Set(graph.nodes.filter(omitted).map(({ number }) => number));

  if (gone.size === 0) {
    return graph;
  }

  return withLinked(
    graph.nodes.filter(({ number }) => !gone.has(number)),
    graph.edges.filter(({ from, to }) => !gone.has(from) && !gone.has(to)),
  );
};

/**
 * `nodes` and `edges`, less what is not a listed issue and is linked by none
 * of `edges`: such a node is drawn only for the issues it is linked to.
 */
const withLinked = (
  nodes: readonly IssueGraphNode[],
  edges: readonly IssueGraphEdge[],
): IssueGraph => {
  const linked = new Set(edges.flatMap(({ from, to }) => [from, to]));

  return {
    nodes: nodes.filter(
      (node) => isListedIssue(node) || linked.has(node.number),
    ),
    edges,
  };
};
