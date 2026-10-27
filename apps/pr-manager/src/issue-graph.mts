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
 * everything else stands, whether a startable issue is being worked on, and
 * the `priority:*` label of what the page read the labels of, and whether
 * it is labelled `pending`.
 */

import {
  decideStartStates,
  withProgress,
  type IssueStartState,
} from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import type { Entry, IssueItem, ReferencedItem } from './load-report.mjs';
import { isPending } from './pending.mjs';
import { priorityOf, type Priority } from './priority.mjs';

/**
 * How a node is drawn.
 *
 * A listed issue takes its {@link IssueStartState}: its start state, or
 * `in-progress` when it is startable and an open pull request closes it
 * (`pr-report-core`'s `withProgress`). Anything else is where it
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
}>;

export type IssueGraphEdge = Readonly<{
  from: number;
  to: number;
  /**
   * `start-after` from what is waited for to the issue waiting; `closes`
   * from an issue to a pull request that closes it.
   */
  kind: 'closes' | 'start-after';
  /**
   * Whether the wait is over: what it runs from is done. Such an edge is
   * still drawn, since it is why the issue reads as ready, but faintly.
   */
  settled: boolean;
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

    return {
      number: issue.number,
      kind: 'issue',
      title: issue.title,
      url: issue.url,
      state: withProgress(state, worked.has(issue.number)),
      priority: priorityOf(issue.labels),
      pending: isPending(issue.labels),
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
        }
      : {
          number,
          kind: item.kind,
          title: item.title,
          url: item.url,
          state: item.status === 'waiting' ? 'open' : item.status,
          priority: 'none',
          pending: false,
        };
  });

  const nodes = [...issueNodes, ...otherNodes].toSorted(
    (a, b) => a.number - b.number,
  );

  const stateOf = new Map(nodes.map(({ number, state }) => [number, state]));

  const edges: readonly IssueGraphEdge[] = [
    ...issues.flatMap(({ number, startAfter }) =>
      startAfter.map((from): IssueGraphEdge => ({
        from,
        to: number,
        kind: 'start-after',
        settled: stateOf.get(from) === 'done',
      })),
    ),
    ...closing.map(({ issue, pull }): IssueGraphEdge => ({
      from: issue,
      to: pull,
      kind: 'closes',
      settled: false,
    })),
  ] as const;

  return { nodes, edges };
};

/** How a listed issue stands for being started, as its row says it. */
export type IssueStart = Readonly<{
  state: IssueStartState;
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
        const state = byNumber.get(number)?.state;

        if (state !== undefined && isIssueStartState(state)) {
          yield [
            number,
            {
              state,
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
 * The graph without what is labelled `pending`, and without the edges that
 * run from it or to it. How the rest stands is left as it was: an issue
 * waiting on one still waits, which its tooltip says. The graph given is
 * handed back when nothing in it is pending.
 */
export const omitPending = (graph: IssueGraph): IssueGraph =>
  omitNodes(graph, ({ pending }) => pending);

const omitNodes = (
  graph: IssueGraph,
  omitted: (node: IssueGraphNode) => boolean,
): IssueGraph => {
  const gone = new Set(graph.nodes.filter(omitted).map(({ number }) => number));

  return gone.size === 0
    ? graph
    : {
        nodes: graph.nodes.filter(({ number }) => !gone.has(number)),
        edges: graph.edges.filter(
          ({ from, to }) => !gone.has(from) && !gone.has(to),
        ),
      };
};
