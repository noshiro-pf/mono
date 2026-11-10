// cspell:ignore RRGGBB

/** The repository a snapshot is of, and what holds for all of it. */

import type { Read } from './read-result.mjs';

/** `owner/name`, as two parts. */
export type RepoRef = Readonly<{ owner: string; name: string }>;

/** A label as GitHub holds it. */
export type Label = Readonly<{
  name: string;
  /** `RRGGBB`, no leading `#`, exactly as the API sends it. */
  color: string;
  description: string;
}>;

export type RepositoryFacts = Readonly<{
  repo: RepoRef;
  defaultBranch: string;
  /**
   * The tip of the default branch, read by its full ref name. Not a part: a
   * reader that cannot read it has no snapshot, since every head is judged
   * against it.
   */
  defaultBranchTip: string;
  /** The login of the token's account, whose comments alone are trusted. */
  viewer: Read<string>;
  /**
   * `.github/CODEOWNERS` on the default branch, `undefined` where there is
   * none. Unread is not none: read as none, a failed fetch would hold nothing
   * and let a pull request waiting for an owner be armed.
   */
  codeOwners: Read<string | undefined>;
  /** Whether the repository has a `merge-queued` label at all. */
  hasQueueLabel: Read<boolean>;
}>;

/**
 * What GitHub enforces on the default branch: every ruleset's rules, read to
 * the last page, and a classic protection rule's contexts (`decisions.md`,
 * "Required contexts").
 */
export type BranchRequirements = Readonly<{
  requiredContexts: readonly string[];
  requireCodeOwnerReview: boolean;
  requireConversationResolution: boolean;
}>;
