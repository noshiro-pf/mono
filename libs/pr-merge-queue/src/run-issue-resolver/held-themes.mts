/**
 * What a theme another session is on is, read from GitHub: the started issues,
 * whose claimant is not the caller, and the issue descriptions their themes
 * come from. `startable-issues` and `run-issue-resolver` both read it, so that
 * a `/resolve-issues` run and the resolver's sessions keep out of each other's
 * themes (#3598).
 */

import { issuePriorityOfLabels, type ReportIssue } from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReadonlyRecord } from 'ts-type-forge';
import { restAllPages, viewerLogin, type ApiContext } from '../lib/index.mjs';
import { readIssueClaimant } from '../start-issue/index.mjs';
import { issueNumbers } from './survey.mjs';
import { issueThemes, primaryThemes, type ThemedIssue } from './themes.mjs';

/**
 * Each theme of `issues`, with the issues about it: of the issues another
 * session started, what `orderByTheme` holds back.
 */
export const issuesByTheme = (
  issues: readonly Readonly<{ number: number; themes: readonly string[] }>[],
): ReadonlyMap<string, readonly number[]> => {
  const mut_held = new Map<string, readonly number[]>();

  for (const { number, themes } of issues) {
    for (const theme of themes) {
      mut_held.set(theme, Arr.toPushed(mut_held.get(theme) ?? [], number));
    }
  }

  return mut_held;
};

/**
 * Of the started issues and who claims each (`undefined`: no claim; an error:
 * it could not be read), the ones someone other than `by` is on. One whose
 * claim could not be read counts as another's, and a note says so: holding a
 * theme back by mistake costs less than two sessions on one.
 */
export const othersStarted = (
  claimants: readonly Readonly<{
    number: number;
    claimant: Result<string | undefined, string>;
  }>[],
  by: string,
): Readonly<{ started: readonly number[]; notes: readonly string[] }> => {
  const unread = claimants.filter(({ claimant }) => Result.isErr(claimant));

  return {
    started: claimants
      .filter(
        ({ claimant }) => !(Result.isOk(claimant) && claimant.value === by),
      )
      .map(({ number }) => number),
    notes: Arr.isNonEmpty(unread)
      ? [
          `${issueNumbers(unread.map(({ number }) => number))}: who started them could not be read; counted as another session's.`,
        ]
      : [],
  };
};

/**
 * Each open issue's description, by number, from a listing of `/issues`;
 * pull requests left out.
 */
export const issueBodies = (
  listed: readonly Readonly<{
    number: number;
    body?: string | null;
    pull_request?: ReadonlyRecord<string, unknown>;
  }>[],
): ReadonlyMap<number, string> =>
  new Map<number, string>(
    listed
      .filter(({ pull_request }) => pull_request === undefined)
      .map(({ number, body }) => [number, body ?? ''] as const),
  );

/** Each open issue's description, by number; empty when they cannot be read. */
export const readIssueBodies = async (
  context: ApiContext,
): Promise<Result<ReadonlyMap<number, string>, string>> =>
  Result.map(
    await restAllPages(context, '/issues', IssueBodyListSchema, {
      query: { state: 'open' },
    }),
    issueBodies,
  );

/**
 * The started issues (`in-progress`: labelled so, or closed by an open pull
 * request) that someone other than `by` is on: every one when `by` is
 * `undefined`, one with no claim naming its claimant too, and one whose claim
 * could not be read, with a note.
 */
export const startedByOthers = async (
  context: ApiContext,
  issues: readonly ReportIssue[],
  by: string | undefined,
): Promise<
  Readonly<{ started: readonly number[]; notes: readonly string[] }>
> => {
  const started = issues
    .filter(({ start }) => start === 'in-progress')
    .map(({ number }) => number);

  if (by === undefined || !Arr.isNonEmpty(started)) {
    return { started, notes: [] };
  }

  const viewer = await viewerLogin(context.token);

  if (Result.isErr(viewer)) {
    return {
      started,
      notes: [
        `Who started the started issues could not be read (${viewer.value}): every one counts as another session's.`,
      ],
    };
  }

  return othersStarted(
    await Promise.all(
      started.map(async (number) => ({
        number,
        claimant: await readIssueClaimant(context, number, viewer.value),
      })),
    ),
    by,
  );
};

/**
 * `candidates` with what `orderByTheme`, `withoutHeldThemes` and `apartFrom`
 * read of each: its tier, every theme and its primary ones, from the report's
 * `issues` and their `bodies` (titles alone for one without). Both
 * `startable-issues` and `run-issue-resolver` build them here, so that they
 * read an issue's themes the same way.
 */
export const themedCandidates = <C extends Readonly<{ number: number }>>(
  candidates: readonly C[],
  issues: readonly ReportIssue[],
  bodies: ReadonlyMap<number, string>,
): readonly (C & ThemedIssue)[] =>
  candidates.map((candidate) => {
    const issue = issues.find(({ number }) => number === candidate.number);

    const title = issue?.title ?? '';

    const body = bodies.get(candidate.number) ?? '';

    return {
      ...candidate,
      tier: tierOf(issue),
      themes: issueThemes(title, body),
      primary: primaryThemes(title, body),
    };
  });

export const tierOf = (issue: ReportIssue | undefined): ThemedIssue['tier'] => {
  const tier =
    issue === undefined
      ? 'none'
      : issuePriorityOfLabels(issue.labels.map(({ name }) => name));

  return tier === 'S' || tier === 'D' ? tier : 'other';
};

const IssueBodyListSchema = t.array(
  t.record({
    number: t.number(),
    body: t.optional(t.union([t.string(), t.nullType])),
    pull_request: t.optional(t.record({})),
  }),
);
