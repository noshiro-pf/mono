/**
 * How long a released pull request may stay unread before it is set aside.
 *
 * Triage reads the checks of a released pull request — one without `skip-ci` —
 * and, for the version pull request, whether it was rebuilt on the tip. While
 * one of those reads fails, nothing else is released: the pull request may be
 * running a matrix, and releasing another beside it starts a second (#2561).
 * That is right while the failure passes, and wrong for good when it does not:
 * a head carrying more check results than the read pages through (#2557's
 * relabelling loop left one with about 2,500) fails the same way on every
 * survey, holds the whole queue, and is never set aside, since a check that
 * cannot be read is never read as failed.
 *
 * So whatever the read was and however it failed, a pull request unread at the
 * same head for {@link UNREAD_SURVEYS_BEFORE_SETTING_ASIDE} surveys in a row is
 * set aside as `read-failed`, with what failed, and the queue moves on. A survey
 * that reads it, or a head that moves, starts the count again; the set-aside
 * clears as `read-failed` is cleared, by a push or the base moving.
 *
 * **Unless GitHub cannot answer the same read anywhere.** Before one is set
 * aside, the loop asks the same kind of read of the tip of the base, which
 * nothing is wrong with; if that fails too, the failure is GitHub's rather than
 * the pull request's, and {@link holdBack} keeps it waiting at the limit, so
 * that an outage holds the queue instead of setting aside every pull request it
 * would release one after another.
 */

import { Arr } from 'ts-data-forge';
import { UNREAD_SURVEYS_BEFORE_SETTING_ASIDE } from './constants.mjs';
import type { PullRequest, SkipRecord } from './types.mjs';

/**
 * A released pull request whose read failed this survey, which read, and what
 * failed: `checks` is the head's check rollup, `rebuiltOnTip` the fetch that
 * says whether the version pull request was rebuilt on the tip.
 */
export type Unread = Readonly<{
  pr: PullRequest;
  read: UnreadRead;
  detail: string;
}>;

export type UnreadRead = 'checks' | 'rebuiltOnTip';

/** For each pull request unread so far, the head and how many surveys in a row. */
export type UnreadStreaks = ReadonlyMap<
  number,
  Readonly<{ headSha: string; surveys: number }>
>;

/**
 * The streaks after one survey, and what to do about this survey's unread pull
 * requests: those that reached the limit are set aside, the rest still hold the
 * queue. A pull request this survey read is dropped from the streaks.
 */
export const advanceUnread = (
  previous: UnreadStreaks,
  unread: readonly Unread[],
): Readonly<{
  streaks: UnreadStreaks;
  setAside: readonly (Unread & Readonly<{ surveys: number }>)[];
  waiting: readonly Unread[];
}> => {
  const counted = unread.map((entry) => {
    const before = previous.get(entry.pr.number);

    return {
      ...entry,
      surveys: before?.headSha === entry.pr.headRefOid ? before.surveys + 1 : 1,
    } as const;
  });

  return {
    streaks: new Map<number, Readonly<{ headSha: string; surveys: number }>>(
      counted
        .filter(({ surveys }) => !reached(surveys))
        .map(({ pr, surveys }) => [
          pr.number,
          { headSha: pr.headRefOid, surveys },
        ]),
    ),
    setAside: counted.filter(({ surveys }) => reached(surveys)),
    waiting: counted
      .filter(({ surveys }) => !reached(surveys))
      .map(({ pr, read, detail }) => ({ pr, read, detail })),
  };
};

/**
 * {@link advanceUnread}'s answer with every set-aside whose kind of read failed
 * for the tip of the base too put back to waiting, its streak kept at the count
 * it reached, so that the next survey finding it unread asks again.
 */
export const holdBack = (
  advanced: ReturnType<typeof advanceUnread>,
  failingEverywhere: ReadonlySet<UnreadRead>,
): ReturnType<typeof advanceUnread> => {
  const held = advanced.setAside.filter(({ read }) =>
    failingEverywhere.has(read),
  );

  return Arr.isEmpty(held)
    ? advanced
    : {
        streaks: new Map<
          number,
          Readonly<{ headSha: string; surveys: number }>
        >([
          ...advanced.streaks,
          ...held.map(
            ({ pr, surveys }) =>
              [pr.number, { headSha: pr.headRefOid, surveys }] as const,
          ),
        ]),
        setAside: advanced.setAside.filter(
          ({ read }) => !failingEverywhere.has(read),
        ),
        waiting: [
          ...advanced.waiting,
          ...held.map(({ pr, read, detail }) => ({ pr, read, detail })),
        ],
      };
};

/**
 * The skip record for one {@link advanceUnread} set aside: `read-failed` at its
 * head and the base it was surveyed on, with what failed in one sentence.
 * The triage note leads with the pull request's number, which the comment and
 * the log already give.
 */
export const readFailedSkip = (
  { pr, detail, surveys }: Unread & Readonly<{ surveys: number }>,
  baseSha: string,
): SkipRecord =>
  ({
    number: pr.number,
    headSha: pr.headRefOid,
    baseSha,
    reason: 'read-failed',
    detail: `unread for ${surveys} surveys in a row; the last read said: ${withoutNumber(detail, pr.number)}`,
  }) as const;

const withoutNumber = (detail: string, prNumber: number): string => {
  const prefix = `#${prNumber}: ` as const;

  return detail.startsWith(prefix) ? detail.slice(prefix.length) : detail;
};

const reached = (surveys: number): boolean =>
  surveys >= UNREAD_SURVEYS_BEFORE_SETTING_ASIDE;
