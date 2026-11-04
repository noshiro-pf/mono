/** How long the loop waits, and how long it waits before giving up. */

/** How many times to re-list while GitHub still reports `UNKNOWN`. */
export const UNKNOWN_STATE_RETRIES = 6;

export const UNKNOWN_STATE_RETRY_MS = 10_000;

/**
 * How many times to read a pull request's review again while GitHub still
 * answers for the head before the push (`triage.mts`'s `readBypassAt`).
 */
export const REVIEW_HEAD_RETRIES = 6;

export const REVIEW_HEAD_RETRY_MS = 5000;

/**
 * How long to wait before surveying again after a rebase that changed nothing,
 * which means the merge state the survey acted on was stale.
 */
export const STALE_STATE_PAUSE_MS = 30_000;

/**
 * How many consecutive polls a pull request may sit with every required context
 * green, and GitHub saying nothing holds the merge, before it is written off as
 * held by something a rebase cannot fix. Triage keeps back the two such things
 * it can read, a missing code-owner approval and an unresolved conversation, so
 * this is what is left: auto-merge armed by someone who may not merge, or a
 * rule nothing here reads.
 */
export const GREEN_POLLS_BEFORE_GIVING_UP = 2;

/**
 * The same, for a pull request GitHub still calls `BLOCKED` while every
 * required context reads green. That usually means the ruleset wants something
 * the checks do not cover, but it is also what a check run that has just been
 * superseded looks like for a moment, so it is given longer.
 */
export const BLOCKED_GREEN_POLLS_BEFORE_GIVING_UP = 5;

/**
 * How many surveys in a row a released pull request may stay unread at the same
 * head before it is set aside as `read-failed` (`unread.mts`). Long enough that
 * GitHub failing for a few minutes holds the queue rather than setting anything
 * aside; each survey is `--active-interval` apart while the list is changing and
 * `--idle-interval` apart once it is not.
 */
export const UNREAD_SURVEYS_BEFORE_SETTING_ASIDE = 5;

/**
 * How long a branch may stay at a commit other than the head GitHub reports for
 * its pull request before the pull request is set aside as `head-out-of-sync`
 * (`out-of-sync.mts`). GitHub takes a push in within seconds, so a mismatch
 * that outlives this is a push it dropped, not someone else's push still on its
 * way.
 */
export const OUT_OF_SYNC_GRACE_MS = 10 * 60_000;

/**
 * How long a watched pull request may go with required contexts unreported and
 * nothing at all running on its head before it is set aside as
 * `checks-not-started` (`not-started.mts`). A released pull request's gates
 * start within seconds, and once a round is under way something on the head is
 * always running until the last aggregate reports, so a head this quiet for
 * this long is one GitHub started no check workflow on.
 */
export const CHECKS_NOT_STARTED_GRACE_MS = 5 * 60_000;

/** How many consecutive polling errors end a watch. */
export const MAX_CONSECUTIVE_POLL_ERRORS = 5;
