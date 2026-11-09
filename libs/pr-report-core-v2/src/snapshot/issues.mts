/** The issues and the merged pull requests a snapshot reads. */

import type { OwnComment } from './pull-request.mjs';
import type { Read } from './read-result.mjs';
import type { Label } from './repository.mjs';

export type IssueFacts = Readonly<{
  number: number;
  /** Lower case: `open` or `closed`. */
  state: string;
  /**
   * Lower case, as GitHub reports it: `completed`, `not_planned` or `duplicate`
   * for a closed one, `reopened` for one reopened, `undefined` for one never
   * closed or closed before GitHub recorded reasons.
   */
  stateReason: string | undefined;
  title: string;
  body: string;
  author: string;
  url: string;
  labels: readonly Label[];
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  /** The issues GitHub records as blocking it, this repository's only. */
  blockedBy: Read<readonly number[]>;
  /** The token's account's comments, for the `start-issue` claim. */
  comments: Read<readonly OwnComment[]>;
}>;

/**
 * What GitHub says about a number a declaration names that is not an issue:
 * an issue named is in `Snapshot.otherIssues` instead, its one home.
 */
export type ReferenceFacts = Readonly<
  | {
      kind: 'pull-request';
      number: number;
      title: string;
      /** Lower case: `open` or `closed`. */
      state: string;
      merged: boolean;
    }
  | { kind: 'unknown'; number: number }
>;

export type MergedPullRequestFacts = Readonly<{
  number: number;
  title: string;
  author: string;
  url: string;
  headRef: string;
  baseRef: string;
  mergedAt: string;
  /** The head it merged at, and the squash commit it became on the base. */
  headSha: string;
  mergeCommitSha: string;
  labels: readonly Label[];
  /**
   * This repository's issues it closed, as `conventions.md` "Closing issues"
   * defines them for an open one: `closingIssuesReferences` where GraphQL is
   * read, and the closing keywords of the body.
   */
  closingIssues: readonly number[];
}>;
