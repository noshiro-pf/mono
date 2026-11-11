/**
 * What `report-unowned-prs` reads and writes over REST: the reports this account
 * has open, and a new one.
 */

import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { unownedReportsOf } from '../conventions/index.mjs';
import { issueTierLabel, type UnownedReport } from '../decide/index.mjs';
import type { Read } from '../snapshot/index.mjs';
import { createIssue } from './rest-description.mjs';
import { pathSegment, restAllPages } from './rest.mjs';
import type { ReadContext } from './transport.mjs';

/**
 * The open issues `viewer` filed that report a pull request as unowned, by their
 * marker. Every page: the account that runs the queue opens most issues and
 * pull requests, so a report can be older than the newest hundred.
 */
export const readUnownedReports = async (
  context: ReadContext,
  viewer: string,
): Promise<Read<readonly UnownedReport[]>> =>
  Result.map(
    await restAllPages(
      context,
      'the open issues this account filed',
      `/issues?state=open&creator=${pathSegment(viewer)}`,
      t.array(ReportSchema),
    ),
    (issues) =>
      Arr.generate(function* () {
        for (const { number, body, pull_request } of issues) {
          // The issues list holds pull requests too.
          if (pull_request === undefined && body !== null) {
            for (const pr of unownedReportsOf(body)) {
              yield { issue: number, pr };
            }
          }
        }
      }),
  );

/**
 * Files a report, labelled `priority:A`: a queue that waits for nothing that
 * will come is the tier of the merge queue stopping (`docs/issue-priority.md`).
 * Answers the issue's number. Through {@link createIssue}, whose answer has the
 * URL too: GitHub always sends it, so an answer without one is not GitHub's.
 */
export const fileUnownedReport = async (
  context: ReadContext,
  report: Readonly<{ title: string; body: string }>,
): Promise<Read<number>> =>
  Result.map(
    await createIssue(context, { ...report, labels: [issueTierLabel('A')] }),
    ({ number }) => number,
  );

const ReportSchema = t.record({
  number: t.number(),
  body: t.union([t.string(), t.nullType]),
  pull_request: t.optional(t.unknown()),
});
