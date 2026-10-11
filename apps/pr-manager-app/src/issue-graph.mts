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
 * everything else stands, and whether a startable issue is being worked on.
 */

import { decideStartStates, type StartState } from 'pr-report-core';
import type { StrictPick } from 'ts-type-forge';
import type { Entry, IssueItem, ReferencedItem } from './load-report.mjs';

/**
 * How a node is drawn.
 *
 * A listed issue takes its {@link StartState}, or `in-progress` when it is
 * startable and an open pull request closes it. Anything else is where it
 * stands: `open` for an open pull request, and for an open issue past the end
 * of the list, whose own declarations were not read; `done`, `abandoned` or
 * `unknown` for the rest, as `ReferenceStatus` says.
 */
export type IssueNodeState =
  StartState | 'abandoned' | 'done' | 'in-progress' | 'open' | 'unknown';

export type IssueGraphNode = Readonly<{
  number: number;
  kind: 'issue' | 'pull-request';
  /** Empty for a number GitHub would not describe. */
  title: string;
  url: string;
  state: IssueNodeState;
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
  'linkedIssues' | 'number' | 'title' | 'url'
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
      state:
        (state === 'free' || state === 'ready') && worked.has(issue.number)
          ? 'in-progress'
          : state,
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
        }
      : {
          number,
          kind: item.kind,
          title: item.title,
          url: item.url,
          state: item.status === 'waiting' ? 'open' : item.status,
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
