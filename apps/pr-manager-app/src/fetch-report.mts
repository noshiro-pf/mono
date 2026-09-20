/**
 * Reading the reports back out of the issues that write them.
 *
 * Two requests a load: the issue `pr-report.yml` writes, and the one
 * `unblock-prs` writes when it acts on something. Asking GitHub about the
 * pull requests directly is what this cannot afford — three requests each,
 * against the 60 an hour an anonymous browser is allowed for the whole
 * address it sits behind. Both reports did that work already, one in a job
 * that holds a token and one on somebody's terminal.
 */

import {
  extractPayload,
  extractRunLog,
  type PrReportPayload,
  type UnblockPrsLog,
} from 'pr-report-payload';
import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { type ReportSource } from './constants.mjs';

export type LoadedReport = Readonly<{
  payload: PrReportPayload;
  /** The issue it was read from, so the page can link at its own source. */
  issueUrl: string;
}>;

export type LoadedRunLog = Readonly<{
  log: UnblockPrsLog;
  issueUrl: string;
}>;

/**
 * What `fetchReport` needs of `globalThis.fetch`, and no more: a route in, an
 * answer out. Everything about *how* to ask belongs to the implementation,
 * which is why the headers are not a parameter.
 *
 * Taken as an argument rather than reached for, so that a test hands in the
 * answer it wants to test against instead of replacing a global and having to
 * put it back — and this repository's lint bans the `afterEach` that would.
 */
export type Fetch = (route: string) => Promise<Response>;

/**
 * The report, or a sentence a reader can act on.
 *
 * Every failure is a failure in front of someone, so none of them is a stack
 * trace: an issue that is not there yet, a quota spent, a body written by a
 * `pr-report` of a different age. {@link extractPayload} words the last of
 * those; this words the ones that happen before there is a body to read.
 */
export const fetchReport = async (
  source: ReportSource,
  fetchImpl: Fetch = askGitHub,
): Promise<Result<LoadedReport, string>> => {
  const issue = await fetchLabelledIssue(source, source.label, fetchImpl);

  if (Result.isErr(issue)) return issue;

  const payload = extractPayload(issue.value.body ?? '');

  return Result.isErr(payload)
    ? payload
    : Result.ok({ payload: payload.value, issueUrl: issue.value.html_url });
};

/**
 * The same, for the issue `unblock-prs` writes.
 *
 * Its own call rather than part of the one above, and its own place in the
 * page's state: the log is secondary, and a missing or unreadable log is not
 * a reason for the page to show nothing. Both are asked for at once, so the
 * second costs wall clock rather than a wait.
 */
export const fetchRunLog = async (
  source: ReportSource,
  fetchImpl: Fetch = askGitHub,
): Promise<Result<LoadedRunLog, string>> => {
  const issue = await fetchLabelledIssue(source, source.runLogLabel, fetchImpl);

  if (Result.isErr(issue)) return issue;

  const log = extractRunLog(issue.value.body ?? '');

  return Result.isErr(log)
    ? log
    : Result.ok({ log: log.value, issueUrl: issue.value.html_url });
};

const API_ROOT = 'https://api.github.com';

/** The one open issue carrying a label, or a sentence saying why not. */
const fetchLabelledIssue = async (
  source: ReportSource,
  label: string,
  fetchImpl: Fetch,
): Promise<Result<Issue, string>> => {
  const query = new URLSearchParams({
    labels: label,
    state: 'open',
    per_page: '1',
  });

  const route =
    `${API_ROOT}/repos/${source.owner}/${source.repo}/issues?${query.toString()}` as const;

  const answered = await request(route, fetchImpl);

  if (Result.isErr(answered)) return answered;

  const parsed = Json.parse(answered.value);

  if (Result.isErr(parsed)) {
    return Result.err(`GitHub did not answer JSON: ${parsed.value}`);
  }

  const validated = IssueListSchema.validate(parsed.value);

  if (Result.isErr(validated)) {
    return Result.err(
      `GitHub answered an unexpected shape:\n${t.validationErrorsToMessages(validated.value).join('\n')}`,
    );
  }

  const issue = validated.value[0];

  return issue === undefined
    ? Result.err(
        `No open issue labelled \`${label}\` in ${source.owner}/${source.repo} yet.`,
      )
    : Result.ok(issue);
};

/**
 * Only the fields the app reads. `t.record` accepts the rest, which is the
 * whole of what GitHub sends about an issue.
 */
const IssueSchema = t.record({
  html_url: t.string(),
  body: t.union([t.nullType, t.string()]),
});

type Issue = t.TypeOf<typeof IssueSchema>;

const IssueListSchema = t.array(IssueSchema);

/**
 * The real one.
 *
 * `no-store` because the point of the button that calls this is to go and
 * look again: a cached answer would make a refresh that changes nothing
 * indistinguishable from a report that has not been rewritten. Written as a
 * wrapper rather than handed over bare, because `fetch` detached from the
 * global it belongs to is not callable in every engine.
 */
const askGitHub: Fetch = async (route) =>
  fetch(route, {
    cache: 'no-store',
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

const request = async (
  route: string,
  fetchImpl: Fetch,
): Promise<Result<string, string>> => {
  const response = await fetchImpl(route).catch((error: unknown) => error);

  if (!(response instanceof Response)) {
    return Result.err(
      'Could not reach the GitHub API. Check the connection and try again.',
    );
  }

  if (response.ok) return Result.ok(await response.text());

  // The one failure a reader can do something about — wait — without reading
  // the body of the answer. A browser has no token, so the quota is 60 an
  // hour and it belongs to the address rather than to the page.
  return Result.err(
    response.headers.get('x-ratelimit-remaining') === '0'
      ? "GitHub's rate limit for unauthenticated readers is spent. It resets within the hour."
      : `GitHub answered ${response.status} ${response.statusText}.`,
  );
};
