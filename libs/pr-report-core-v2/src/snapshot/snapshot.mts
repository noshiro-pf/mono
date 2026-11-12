/**
 * Every fact any decision needs, read before anything is decided
 * (`libs/pr-merge-queue-v2/spec/README.md`, "Read, decide, act"). The page,
 * `pr-report` and the worker build one with their own reader and transport and
 * hand it to the same decisions.
 */

import type { HeadChecks } from './checks.mjs';
import type {
  IssueFacts,
  MergedPullRequestFacts,
  ReferenceFacts,
} from './issues.mjs';
import type { QueueLayersFacts } from './layers.mjs';
import type { PullRequestFacts } from './pull-request.mjs';
import type { Read } from './read-result.mjs';
import type { BranchRequirements, RepositoryFacts } from './repository.mjs';

export type Snapshot = Readonly<{
  /**
   * ISO 8601: when the read began, for showing how old the snapshot is.
   * Decisions are measured from the `now` their caller passes, one clock for
   * every rule.
   */
  readAt: string;
  /** Whether a token was used, which decides how much is known. */
  authenticated: boolean;
  repository: RepositoryFacts;
  requirements: Read<BranchRequirements>;
  /**
   * The checks on the default branch's tip: read beside a released pull
   * request's, so that a read failing on both is told for GitHub's outage
   * rather than the pull request's.
   */
  defaultBranchChecks: Read<HeadChecks>;
  /**
   * Every open pull request, lowest number first. Unread, nothing about the
   * queue is decided — an empty list would read as a queue with nothing in it —
   * and the worker plans nothing that cycle; the page keeps its last good
   * answer.
   */
  pullRequests: Read<readonly PullRequestFacts[]>;
  /**
   * The open issues read, most recently updated first, cut short at the
   * caller's limit (`--issues-limit`).
   */
  openIssues: Read<OpenIssues>;
  /**
   * Issues the open pull requests close, or a declaration names, that are not
   * in `openIssues`, open or closed: `openIssues` is cut short, and their
   * `Start-After:` is inherited all the same. Each says its own state.
   */
  otherIssues: Read<ReadonlyMap<number, IssueFacts>>;
  /**
   * Every number a declaration names that neither `pullRequests`, `openIssues`
   * nor `otherIssues` covers: a merged or closed pull request, or a number
   * naming nothing the reader may see. Never an issue.
   */
  references: Read<ReadonlyMap<number, ReferenceFacts>>;
  merged: Read<readonly MergedPullRequestFacts[]>;
  queueLayers: Read<QueueLayersFacts>;
  /**
   * Where each branch's tip is, by `git ls-remote --heads`: a head GitHub shows
   * that the branch is not at is a push GitHub dropped.
   */
  branchTips: Read<ReadonlyMap<string, string>>;
  /**
   * The pull requests the reader was asked to follow that are no longer open,
   * such as the worker's released one: whether each merged or was closed.
   */
  followed: Read<readonly FollowedPullRequest[]>;
}>;

/** A pull request no longer open, as {@link Snapshot.followed} lists it. */
export type FollowedPullRequest = Readonly<{
  number: number;
  state: 'closed' | 'merged';
  /** When it merged or was closed. */
  at: string;
}>;

export type OpenIssues = Readonly<{
  issues: readonly IssueFacts[];
  /**
   * Whether `issues` is every open issue: `false` once the limit cut it short,
   * so a full list is not mistaken for the whole.
   */
  complete: boolean;
}>;
