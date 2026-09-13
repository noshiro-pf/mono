/** How long the loop waits, and how long it waits before giving up. */

/** How many times to re-list while GitHub still reports `UNKNOWN`. */
export const UNKNOWN_STATE_RETRIES = 6;

export const UNKNOWN_STATE_RETRY_MS = 10_000;

/**
 * How long to wait before surveying again after a rebase that changed
 * nothing, which means the merge state the survey acted on was stale.
 */
export const STALE_STATE_PAUSE_MS = 30_000;

/**
 * How many consecutive polls a pull request may sit with every required
 * context green, and GitHub saying nothing holds the merge, before it is
 * written off as held by something a rebase cannot fix — a missing review, an
 * unresolved conversation, auto-merge armed by someone who may not merge.
 */
export const GREEN_POLLS_BEFORE_GIVING_UP = 3;

/**
 * The same, for a pull request GitHub still calls `BLOCKED` while every
 * required context reads green. That usually means the ruleset wants
 * something the checks do not cover, but it is also what a check run that has
 * just been superseded looks like for a moment, so it is given longer.
 */
export const BLOCKED_GREEN_POLLS_BEFORE_GIVING_UP = 8;

/** How many consecutive polling errors end a watch. */
export const MAX_CONSECUTIVE_POLL_ERRORS = 5;
