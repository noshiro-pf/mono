/**
 * Which open issues may be started, and in what order (`spec/decisions.md`,
 * "Startable issues" and "Issue themes"): what `startable-issues` lists and
 * `run-issue-resolver` hands out, decided over the issues `decideQueue` read.
 */

import { Arr, Result } from 'ts-data-forge';
import { hasLabel, NOT_FOR_RESOLVER_LABELS } from '../conventions/index.mjs';
import {
  issueStartRank,
  issueTierLabel,
  issueTierOf,
  type IssueTier,
} from './issues.mjs';
import { labelNames, type IssueDecision } from './queue.mjs';
import {
  issuesByTheme,
  issueThemes,
  primaryThemes,
  type ThemedIssue,
} from './themes.mjs';

/**
 * The startable issues of `issues`, sorted into the four kinds the spec names.
 * `attempted` is the `run-issue-resolver` record: each issue a session left,
 * with its `updatedAt` then, or `undefined` when that was not read.
 */
export const surveyIssues = (
  issues: readonly IssueDecision[],
  options: Readonly<{
    /** Whose issues may be started; logins compared case-insensitively. */
    authors: readonly string[];
    attempted: ReadonlyMap<number, string | undefined>;
  }>,
): IssueSurvey => {
  const logins = new Set<string>(
    options.authors.map((login) => login.toLowerCase()),
  );

  const startable = issues.filter(
    ({ start }) => start === 'free' || start === 'ready',
  );

  const kinds = startable.map((decided) => {
    const issue = decided.facts;

    const labels = labelNames(issue.labels);

    const attempted = options.attempted.has(issue.number);

    const kind: 'foreign' | 'fresh' | 'held' | 'left' = !logins.has(
      issue.author.toLowerCase(),
    )
      ? 'foreign'
      : HELD_LABELS.some((name) => hasLabel(labels, name))
        ? 'held'
        : attempted &&
            (options.attempted.get(issue.number) ?? issue.updatedAt) ===
              issue.updatedAt
          ? 'left'
          : 'fresh';

    return { kind, decided, labels } as const;
  });

  const numbersOf = (kind: 'foreign' | 'held' | 'left'): readonly number[] =>
    Arr.toSorted(
      kinds
        .filter((each) => each.kind === kind)
        .map(({ decided }) => decided.facts.number),
    );

  return {
    fresh: kinds
      .filter(({ kind }) => kind === 'fresh')
      .map(({ decided, labels }) => startableOf(decided, labels))
      .toSorted((a, b) =>
        a.rank === b.rank ? a.number - b.number : a.rank - b.rank,
      ),
    left: numbersOf('left'),
    foreign: numbersOf('foreign'),
    held: numbersOf('held'),
  };
};

/**
 * The themes another session is on: the primary themes of each `in-progress`
 * issue whose live claim names someone other than `by`, or that has no claim;
 * with `by` undefined, of every `in-progress` issue. One whose comments are
 * unread counts as another's and is named in `unread`: holding a theme back by
 * mistake costs less than two sessions on one.
 */
export const heldThemes = (
  issues: readonly IssueDecision[],
  by: string | undefined,
): HeldThemes => {
  const started = issues.filter(({ start }) => start === 'in-progress');

  const others = started.filter(
    ({ claim, facts }) =>
      by === undefined ||
      Result.isErr(facts.comments) ||
      claim?.state !== 'started' ||
      claim.by !== by,
  );

  return {
    held: issuesByTheme(
      others.map(({ facts }) => ({
        number: facts.number,
        themes: primaryThemes(facts.title, facts.body),
      })),
    ),
    unread:
      by === undefined
        ? []
        : others
            .filter(({ facts }) => Result.isErr(facts.comments))
            .map(({ facts }) => facts.number),
  };
};

/**
 * Labels that keep a startable issue as it is: a question first, one that will
 * not be done or is a duplicate, one its author paused (`pending`, which
 * `pr-report` asks to move to `priority:hold`), and the tiers for either.
 */
export const HELD_LABELS = [
  ...NOT_FOR_RESOLVER_LABELS,
  issueTierLabel('hold'),
  issueTierLabel('close'),
] as const;

/** A startable issue, with what the order and the listing read of it. */
export type StartableIssue = ThemedIssue &
  Readonly<{
    title: string;
    url: string;
    /** As read, for the `run-issue-resolver` record. */
    updatedAt: string;
    /** The tier its labels carry. */
    issueTier: IssueTier | 'none' | 'several';
    /** {@link issueStartRank}: the order tiers are started in. */
    rank: number;
  }>;

export type IssueSurvey = Readonly<{
  /** Startable and not left as they stand, by tier then lowest number. */
  fresh: readonly StartableIssue[];
  /** Startable, and left by a `run-issue-resolver` session as they stand. */
  left: readonly number[];
  /** Startable, but written by someone outside the authors. */
  foreign: readonly number[];
  /** Startable, but carrying one of {@link HELD_LABELS}. */
  held: readonly number[];
}>;

export type HeldThemes = Readonly<{
  /** Each held theme, with the started issues on it. */
  held: ReadonlyMap<string, readonly number[]>;
  /** Started issues counted as another's because their claim was unread. */
  unread: readonly number[];
}>;

const startableOf = (
  decided: IssueDecision,
  labels: readonly string[],
): StartableIssue => {
  const { number, title, body, url, updatedAt } = decided.facts;

  const issueTier = issueTierOf(labels);

  return {
    number,
    title,
    url,
    updatedAt,
    issueTier,
    rank: issueStartRank(labels),
    tier: issueTier === 'S' || issueTier === 'D' ? issueTier : 'other',
    themes: issueThemes(title, body),
    primary: primaryThemes(title, body),
  };
};
