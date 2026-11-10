/**
 * One part of a snapshot, as read: the facts, or why they could not be read.
 *
 * A part that failed is kept apart from one that is empty. Read as nothing, the
 * checks of a pull request would show every required context missing and call a
 * failing pull request one whose checks have not started; so every decision
 * that needs a part is handed this and has to say what it does when the part is
 * unread.
 */

import type { Result } from 'ts-data-forge';

export type Read<A> = Result<A, ReadError>;

/**
 * Why a part was not read.
 *
 * - `rate-limited` — GitHub's primary or secondary limit, whatever the status
 *   (a 403 or 429 with `retry-after` or `x-ratelimit-remaining: 0`, or a 200
 *   whose GraphQL `errors` say `RATE_LIMITED`); it passes.
 * - `unavailable` — a 5xx, a timeout, a dropped connection; it passes.
 * - `refused` — any other 4xx, a GraphQL `errors` entry of type `FORBIDDEN` or
 *   `NOT_FOUND` (what REST answers 403 or 404 for), or GraphQL refused by a
 *   proxy; it does not pass on its own.
 * - `malformed` — an answer of a shape nobody expected, or a GraphQL `errors`
 *   entry of any other type (partial data with it is dropped).
 * - `skipped` — a part this reader does not offer at all, such as the native
 *   stack of a pull request, which only GraphQL serves, for a REST reader.
 *   Never a choice made from what the plan
 *   might need: every reader reads every part it can for every open pull
 *   request, so that a decision is a total function of the snapshot.
 */
export type ReadError = Readonly<{
  kind: 'malformed' | 'rate-limited' | 'refused' | 'skipped' | 'unavailable';
  /** What was being read, for a message: `the checks of #3712`. */
  what: string;
  message: string;
}>;
