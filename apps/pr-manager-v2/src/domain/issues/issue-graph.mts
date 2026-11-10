import {
  hasLabel,
  PullRequestLabel,
  type PullRequestDecision,
  type Snapshot,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import { priorityOf, type Priority } from '../merge-order/index.mjs';
import { repoUrl } from '../repo.mjs';
import type { IssueClaimView, IssueRow, Tier } from './issue-row.mjs';

/** One node of the issue DAG (spec §11.3). */
export type DagNode = Readonly<{
  /** `i3790` for an issue, `p3801` for a pull request. */
  id: string;
  kind: 'issue' | 'pull';
  number: number;
  title: string;
  url: string;
  state: DagState;
  /** An issue's tier, a pull request's priority; nothing for none. */
  pill: Priority | Tier | undefined;
  /** A pull request labelled `pending`: drawn faint. */
  faint: boolean;
  claim: IssueClaimView | undefined;
  /** Drawn because a drawn issue waits on it, not because the filters show it. */
  extra: boolean;
}>;

/**
 * - `ready`, `free` — can start, the wait over or none: green, `ready` thick.
 * - `waiting` — waits on something open: brown, dashed.
 * - `planned`, `in-progress`, `attention`, `cycle` — as the start state says.
 * - `pull` — an open pull request: blue.
 * - `closed` — closed unfinished: grey.
 * - `unread` — open past what the list read, or not read at all, so its own
 *   state is unknown: grey, dotted.
 */
export type DagState =
  | 'attention'
  | 'closed'
  | 'cycle'
  | 'free'
  | 'in-progress'
  | 'planned'
  | 'pull'
  | 'ready'
  | 'unread'
  | 'waiting';

export type DagEdge = Readonly<{
  /** What is waited for, or the issue a pull request closes. */
  from: string;
  to: string;
  /** `closes` is drawn dashed. */
  kind: 'closes' | 'waits';
}>;

export type IssueGraph = Readonly<{
  nodes: readonly DagNode[];
  edges: readonly DagEdge[];
}>;

/**
 * The graph of what the drawn issues wait for: each drawn issue; each open or
 * unfinished issue one of them waits on, drawn though the filters leave it out
 * (and not counted); and each open pull request closing a drawn issue. Done
 * issues and merged pull requests are not drawn, nor the waits on them.
 */
export const issueGraphOf = (
  drawn: readonly IssueRow[],
  rows: ReadonlyMap<number, IssueRow>,
  pullRequests: readonly PullRequestDecision[],
  snapshot: Snapshot,
): IssueGraph => {
  const mut_nodes = new Map<string, DagNode>(
    drawn.map((row) => [issueId(row.number), nodeOfRow(row, false)]),
  );

  const mut_edges: DagEdge[] = [];

  const openPulls = new Map<number, PullRequestDecision>(
    pullRequests.map((pr) => [pr.facts.number, pr]),
  );

  for (const row of drawn) {
    for (const wait of row.waits) {
      if (wait.status === 'done') {
        continue;
      }

      // `Start-After:` may name an open pull request: drawn as one.
      const pull = openPulls.get(wait.number);

      const id =
        pull === undefined ? issueId(wait.number) : pullId(wait.number);

      if (!mut_nodes.has(id)) {
        const listed = rows.get(wait.number);

        mut_nodes.set(
          id,
          pull !== undefined
            ? pullNode(pull)
            : listed === undefined
              ? namedNode(wait.number, wait.status, snapshot)
              : nodeOfRow(listed, true),
        );
      }

      mut_edges.push({ from: id, to: issueId(row.number), kind: 'waits' });
    }
  }

  for (const pr of pullRequests) {
    const { facts } = pr;

    if (Result.isErr(facts.closingIssues)) {
      continue;
    }

    const closes = facts.closingIssues.value.filter(({ number }) =>
      mut_nodes.has(issueId(number)),
    );

    if (Arr.isEmpty(closes)) {
      continue;
    }

    mut_nodes.set(pullId(facts.number), pullNode(pr));

    for (const { number } of closes) {
      mut_edges.push({
        from: issueId(number),
        to: pullId(facts.number),
        kind: 'closes',
      });
    }
  }

  return { nodes: Array.from(mut_nodes.values()), edges: mut_edges };
};

export const issueId = (number: number): string => `i${number}` as const;

const pullId = (number: number): string => `p${number}` as const;

const noneAsUndefined = <P extends string>(p: P | 'none'): P | undefined =>
  p === 'none' ? undefined : p;

const pullNode = ({ facts }: PullRequestDecision): DagNode => {
  const labels = facts.labels.map(({ name }) => name);

  return {
    id: pullId(facts.number),
    kind: 'pull',
    number: facts.number,
    title: facts.title,
    url: facts.url,
    state: 'pull',
    pill: noneAsUndefined(priorityOf(labels)),
    faint: hasLabel(labels, PullRequestLabel.pending),
    claim: undefined,
    extra: false,
  };
};

const nodeOfRow = (row: IssueRow, extra: boolean): DagNode =>
  ({
    id: issueId(row.number),
    kind: 'issue',
    number: row.number,
    title: row.title,
    url: row.url,
    state: row.start === 'blocked' ? ('waiting' as const) : row.start,
    pill: noneAsUndefined(row.tier),
    faint: false,
    claim: row.claim,
    extra,
  }) as const;

/**
 * An issue named that the open list did not read: closed unfinished, or open
 * past what the list read or not read at all, whose own start state is unknown,
 * so it is never drawn as one that can start.
 */
const namedNode = (
  number: number,
  status: 'abandoned' | 'unknown' | 'waiting',
  snapshot: Snapshot,
): DagNode => {
  const other = Result.isOk(snapshot.otherIssues)
    ? snapshot.otherIssues.value.get(number)
    : undefined;

  return {
    id: issueId(number),
    kind: 'issue',
    number,
    title: other?.title ?? `#${number}`,
    url: other?.url ?? `${repoUrl(snapshot.repository.repo)}/issues/${number}`,
    state: status === 'abandoned' ? 'closed' : 'unread',
    pill: undefined,
    faint: false,
    claim: undefined,
    extra: true,
  };
};
