/** The report as the app reads it, rather than as a person does. */

import { PAYLOAD_VERSION, type PrReportPayload } from 'pr-report-payload';
import { summarize } from './summarize.mjs';
import { type PrReport } from './types.mjs';

/**
 * The report reduced to what travels in the issue body.
 *
 * Written field by field rather than by spreading the entry, and that is the
 * whole of the design: a spread would carry `body` and `reported` along with
 * everything else, and the day someone adds a field to {@link PrReport} it
 * would carry that too. The body is by far the largest thing read about a
 * pull request and nothing displays it — what is read *out* of it, the
 * `Merge-After:` numbers and the issues it closes, is already here — and the
 * per-context map is a verdict per required check that `checks` summarises.
 * An issue body holds 65536 characters, and both of those grow with the
 * number of open pull requests.
 */
export const toPayload = (report: PrReport): PrReportPayload =>
  ({
    version: PAYLOAD_VERSION,
    repo: report.repo,
    generatedAt: report.generatedAt,
    generatedAtEpochMs: Temporal.Instant.from(report.generatedAt)
      .epochMilliseconds,
    authenticated: report.authenticated,
    required: report.required,
    summary: summarize(report),
    entries: report.entries.map((entry) => ({
      number: entry.number,
      title: entry.title,
      author: entry.author,
      url: entry.url,
      isDraft: entry.isDraft,
      labels: entry.labels,
      autoMerge: entry.autoMerge,
      headRef: entry.headRef,
      baseRef: entry.baseRef,
      updatedAt: entry.updatedAt,
      // `null` rather than the absent property: this is JSON by the time
      // anything reads it, and `undefined` is not a value JSON has.
      comparison: entry.comparison ?? null,
      linkedIssues: entry.linkedIssues,
      mergeAfter: entry.mergeAfter,
      blockedBy: entry.blockedBy,
      checks: entry.checks,
    })),
    roots: report.roots,
    cycles: report.cycles,
    merged: report.merged.map((pr) => ({
      ...pr,
      mergedAtEpochMs: Temporal.Instant.from(pr.mergedAt).epochMilliseconds,
    })),
    mergedWithinDays: report.mergedWithinDays,
  }) as const;
