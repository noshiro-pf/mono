/** Everything read about one open pull request, before anything is decided. */

import type { HeadChecks } from './checks.mjs';
import type { Read } from './read-result.mjs';
import type { Label } from './repository.mjs';

export type PullRequestFacts = Readonly<{
  number: number;
  title: string;
  /**
   * Where `Merge-After:` is read from; the closing keywords are read from its
   * rendering, as GitHub marked them.
   */
  body: string;
  author: string;
  url: string;
  isDraft: boolean;
  labels: readonly Label[];
  /** Whether auto-merge is armed. */
  autoMerge: boolean;
  headRef: string;
  headSha: string;
  baseRef: string;
  /** Whether the head branch lives in a fork. */
  fromFork: boolean;
  /** GitHub's `mergeStateStatus`, upper case: `BEHIND`, `CLEAN`, `UNKNOWN`, … */
  mergeState: string;
  createdAt: string;
  updatedAt: string;
  /** When the head commit was made. */
  headCommittedAt: Read<string>;
  /**
   * The parts read for one pull request, each on its own. A reader that does
   * not read a part at all leaves it an error of kind `skipped`.
   */
  checks: Read<HeadChecks>;
  review: Read<ReviewFacts>;
  comments: Read<readonly OwnComment[]>;
  closingIssues: Read<readonly ClosingIssue[]>;
  comparison: Read<Comparison>;
  nativeStack: Read<NativeStackEntry | undefined>;
  /**
   * The branches GitHub moved its base off, oldest first, from the timeline:
   * a layer moved onto the default branch when the one below it merged.
   */
  baseChanges: Read<readonly BaseChange[]>;
  /**
   * The merged pull request whose head branch the last of {@link baseChanges}
   * moved this one off, read by that branch whatever the merged window, or
   * `undefined` for one never moved off a merged pull request.
   */
  mergedParent: Read<MergedParent | undefined>;
}>;

/**
 * What restacking a pull request moved off a merged parent reads: it is rebased
 * `--onto` {@link mergeCommitSha} from {@link headSha} while it still contains
 * that head.
 */
export type MergedParent = Readonly<{
  number: number;
  /** The head the parent merged at. */
  headSha: string;
  /** The squash commit on the base. */
  mergeCommitSha: string;
  /** Whether this pull request's head still contains {@link headSha}. */
  containsHead: boolean;
}>;

/** One `base_ref_changed` event of a pull request's timeline. */
export type BaseChange = Readonly<{ from: string; to: string; at: string }>;

/** What a review rule reads. */
export type ReviewFacts = Readonly<{
  /** The latest review of each login, approving or not. */
  latestReviews: readonly LatestReview[];
  /** Every changed file read. */
  files: readonly ChangedFile[];
  /**
   * Whether `files` is every file the pull request changes: `false` once the
   * list was cut short. Renames are told by {@link ChangedFile.previousPath},
   * not here.
   */
  filesComplete: boolean;
  /**
   * How many review conversations are open, or `unknown` for a reader that
   * cannot tell: REST does not say whether a thread is resolved.
   */
  unresolvedConversations: number | 'unknown';
  /**
   * Who pushed to the branch since it was created, from the repository's
   * activity, or `unknown` where the chain of pushes has a gap.
   */
  pushers: readonly string[] | 'unknown';
}>;

/**
 * The latest opinionated review of each login with write access: GraphQL's
 * `latestOpinionatedReviews(writersOnly: true)`. A REST reader takes each
 * login's latest submitted review in one of these three states (a pending or
 * comment-only one is passed over), and keeps the logins whose permission on
 * the repository is `write` or above; that is what the two readers are tested
 * to agree on. A comment-only review after an approval leaves the approval
 * standing, as GitHub counts it.
 */
export type LatestReview = Readonly<{
  login: string;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'DISMISSED';
}>;

/**
 * One changed file. A rename or a copy changes its old path too, which a check
 * enforcing `CODEOWNERS` counts; GraphQL names only the new one.
 */
export type ChangedFile = Readonly<{
  path: string;
  change:
    | 'added'
    | 'changed'
    | 'copied'
    | 'modified'
    | 'removed'
    | 'renamed'
    | 'unchanged';
  /**
   * The old path of a rename or copy, where the reader was told it; a `renamed`
   * or `copied` change without one is a path nobody can judge.
   */
  previousPath: string | undefined;
}>;

/**
 * A comment the token's account wrote, oldest first. Only these are read for
 * the queue's records (`conventions.md`, "Comment records").
 */
export type OwnComment = Readonly<{
  id: number;
  body: string;
  createdAt: string;
}>;

/** An issue of this repository the pull request closes. */
export type ClosingIssue = Readonly<{
  number: number;
  title: string;
  url: string;
  state: 'closed' | 'open' | 'unknown';
}>;

/**
 * Commits the head has that its base's tip does not, and the other way round.
 * `behindBy` 0 is the head containing the tip: whether the version pull request
 * was rebuilt on it, and whether one kept on the tip is behind, which the merge
 * state cannot say under `skip-ci`.
 */
export type Comparison = Readonly<{ aheadBy: number; behindBy: number }>;

/** A pull request's place in one of GitHub's native stacks. */
export type NativeStackEntry = Readonly<{
  stack: number;
  /** 1 for the layer on the base branch. */
  position: number;
  size: number;
}>;
