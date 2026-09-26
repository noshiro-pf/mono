/**
 * How long the loop sleeps when there is nothing to do: briefly while the
 * list is still changing, so a pull request queued a moment ago is picked up
 * in seconds, and at the idle interval once it has sat still for a while.
 */

import { isRecord } from 'ts-data-forge';
import { type StrictPick } from 'ts-type-forge';
import { type Options } from './options.mjs';
import { type Quiet, type Survey } from './types.mjs';

export const initialQuiet: Quiet = {
  fingerprint: undefined,
  unchanged: 0,
} as const;

/**
 * The part of a survey triage reads: the base, and for every open pull
 * request its head, merge state, labels, auto-merge, draft flag and body —
 * the body because that is where `Merge-After:` is declared — and what the
 * reviews hold, which triage reads separately: an approval or a resolved
 * conversation is exactly what a held pull request is waiting for. The title
 * is left out, as is the order `gh` lists things in.
 */
export const surveyFingerprint = (
  survey: StrictPick<Survey, 'baseSha' | 'pullRequests'>,
  reviewHolds: readonly string[] = [],
): string =>
  JSON.stringify({
    baseSha: survey.baseSha,
    reviewHolds: reviewHolds.toSorted(),
    pullRequests: survey.pullRequests
      .toSorted((a, b) => a.number - b.number)
      .map((pr) => [
        pr.number,
        pr.headRefOid,
        pr.baseRefName,
        pr.mergeStateStatus,
        pr.isDraft,
        isRecord(pr.autoMergeRequest),
        pr.labels.map((label) => label.name).toSorted(),
        pr.body,
      ]),
  });

export const observeSurvey = (quiet: Quiet, fingerprint: string): Quiet =>
  ({
    fingerprint,
    unchanged:
      quiet.fingerprint === fingerprint ? quiet.unchanged + 1 : (0 as const),
  }) as const;

export const idleWaitSec = (
  quiet: Quiet,
  options: StrictPick<
    Options,
    'activeIntervalSec' | 'idleAfter' | 'idleIntervalSec'
  >,
): number =>
  quiet.unchanged >= options.idleAfter
    ? options.idleIntervalSec
    : options.activeIntervalSec;
