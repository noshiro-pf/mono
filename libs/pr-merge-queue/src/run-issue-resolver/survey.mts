/** Which issue a round hands a session, read without the model. */

import {
  hasLabel,
  issuePriorityLabel,
  issueStartRank,
  PENDING_LABEL,
  type ReportIssue,
} from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import type { StrictOmit, StrictPick } from 'ts-type-forge';
import type { ReadReportOptions } from '../pr-report/index.mjs';

/**
 * Picks the issues a session may start, in the order it takes them.
 *
 * Startable is what `docs/issue-start-after.md` calls `ready` or `free`, as the
 * report decides it: nothing it waits for is open, nobody has labelled it
 * `in-progress` or `planned`, and no open pull request closes it. Of those it
 * keeps the ones `authors` wrote, since the session acts on what the issue says
 * with the token and no person in between, and none carrying one of
 * {@link HELD_LABELS}.
 *
 * `attempted` is the issues handed to earlier sessions (`attempted.mts`), with
 * what each one's `updatedAt` read once its session ended, or `undefined` when
 * it could not be read. One a session ended on with no pull request (too large,
 * a decision that is a person's) is not handed on again until someone changes
 * it; `undefined` holds it until the record is removed.
 */
export const surveyIssues = (
  issues: readonly ReportIssue[],
  authors: ReadonlySet<string>,
  attempted: ReadonlyMap<number, string | undefined>,
): IssueSurvey => {
  const mut_fresh: (IssueCandidate & Readonly<{ rank: number }>)[] = [];

  const mut_left: number[] = [];

  const mut_foreign: number[] = [];

  const mut_held: number[] = [];

  // GitHub's logins are not case-sensitive.
  const logins = new Set<string>(
    Array.from(authors, (login) => login.toLowerCase()),
  );

  for (const issue of issues) {
    if (issue.start !== 'free' && issue.start !== 'ready') {
      continue;
    }

    if (!logins.has(issue.author.toLowerCase())) {
      mut_foreign.push(issue.number);

      continue;
    }

    if (HELD_LABELS.some((name) => hasLabel(issue.labels, name))) {
      mut_held.push(issue.number);

      continue;
    }

    if (
      attempted.has(issue.number) &&
      (attempted.get(issue.number) ?? issue.updatedAt) === issue.updatedAt
    ) {
      mut_left.push(issue.number);

      continue;
    }

    mut_fresh.push({
      number: issue.number,
      url: issue.url,
      updatedAt: issue.updatedAt,
      rank: issueStartRank(issue.labels.map(({ name }) => name)),
    });
  }

  return {
    fresh: mut_fresh
      .toSorted((a, b) =>
        a.rank === b.rank ? a.number - b.number : a.rank - b.rank,
      )
      .map(({ number, url, updatedAt }) => ({ number, url, updatedAt })),
    left: Arr.toSorted(mut_left),
    foreign: Arr.toSorted(mut_foreign),
    held: Arr.toSorted(mut_held),
  };
};

/**
 * A line for each kind of startable issue the survey passed over, as
 * `run-issue-resolver` logs them and `startable-issues` prints them.
 * `stoppedAtCap` is the part of `left` that a session's cap stopped during the
 * run, which a later run tries again, said apart from the rest.
 */
export const passedOverNotes = (
  survey: StrictPick<IssueSurvey, 'left' | 'foreign' | 'held'>,
  authors: readonly string[],
  stoppedAtCap: readonly number[] = [],
): readonly string[] => {
  const left = survey.left.filter((number) => !stoppedAtCap.includes(number));

  return [
    ...(Arr.isNonEmpty(left)
      ? [
          `${issueNumbers(left)}: an earlier run-issue-resolver session left them as they stand; waiting for someone to change them.`,
        ]
      : []),
    ...(Arr.isNonEmpty(stoppedAtCap)
      ? [
          `${issueNumbers(stoppedAtCap)}: a session stopped at its cap; a later run, capping one higher, tries again.`,
        ]
      : []),
    ...(Arr.isNonEmpty(survey.foreign)
      ? [
          `${issueNumbers(survey.foreign)}: startable, but not written by ${authors.join(' or ')}; left to a person.`,
        ]
      : []),
    ...(Arr.isNonEmpty(survey.held)
      ? [
          `${issueNumbers(survey.held)}: startable, but labelled ${HELD_LABELS.join(', ')} or the like; left as they are.`,
        ]
      : []),
  ];
};

/** `#1, #2`, for a log line. */
export const issueNumbers = (list: readonly number[]): string =>
  list.map((number) => `#${number}`).join(', ');

/**
 * What a survey of the issues reads of the report, `startable-issues`' included:
 * up to a thousand open issues, rather than the report's thirty, since the
 * oldest are as startable as the newest; the merged list as short as it goes;
 * and no pull request's comparison or check states, which decide nothing of an
 * issue and cost about four requests each.
 */
export const ISSUES_READ = {
  mergedDays: 1,
  mergedLimit: 1,
  issuesLimit: 1000,
  checks: false,
} as const satisfies StrictOmit<ReadReportOptions, 'repo'>;

/**
 * Labels that say an issue is not to be started as it stands: a question to
 * answer first, one that will not be done, or one the author is holding back,
 * or one placed under the tier for either (`docs/issue-priority.md`).
 * `pending` is a pull request's label, and `pr-report` asks for an issue
 * carrying it to be moved to `priority:hold`; until it is, it still holds the
 * issue back, so that an issue its author paused is never started by mistake.
 */
export const HELD_LABELS = [
  'duplicate',
  'invalid',
  'question',
  'wontfix',
  PENDING_LABEL,
  issuePriorityLabel('hold'),
  issuePriorityLabel('close'),
] as const;

/** A startable issue, as a session is handed it. */
export type IssueCandidate = Readonly<{
  number: number;
  url: string;
  /** As the survey read it. */
  updatedAt: string;
}>;

export type IssueSurvey = Readonly<{
  /**
   * Startable, and not yet handed to a round as they stand, in the order they
   * are taken: by tier (`issueStartRank`), the oldest first within each.
   */
  fresh: readonly IssueCandidate[];
  /** Startable, and left by an earlier round as they stand. */
  left: readonly number[];
  /** Startable, but written by someone outside `authors`. */
  foreign: readonly number[];
  /** Startable, but carrying one of {@link HELD_LABELS}. */
  held: readonly number[];
}>;
