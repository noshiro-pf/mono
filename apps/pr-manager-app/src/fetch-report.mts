/**
 * Reading the report back out of the issue `pr-report.yml` writes.
 *
 * The app asks GitHub for one issue and nothing else. Asking it about the
 * pull requests directly is what it cannot afford: three requests each — the
 * comparison against the base and the two kinds of check — against the 60 an
 * hour an anonymous browser is allowed, shared with everyone behind the same
 * address. The report already did that work, in a job that holds a token.
 *
 * **Every request is conditional**, and it is worth being exact about what
 * that buys, because the obvious answer is wrong here. Sending an `ETag` back
 * as `If-None-Match` gets a `304` that costs nothing against the quota *for
 * an authenticated caller* — measured, `x-ratelimit-remaining` unchanged
 * across four of them. **An anonymous caller is charged for the 304 as well**
 * — measured on the same endpoint minutes later, 59, 58, 57 across three.
 * This page is the anonymous one, so the conditional request saves the
 * transfer and the parse, and saves nothing at all on the rate limit;
 * `POLL_INTERVAL_MS` is what keeps the page inside 60 an hour. The header is
 * sent anyway: it is free, it is correct, and it is what would make a much
 * shorter interval possible the day this page carries a token.
 *
 * GitHub allows `If-None-Match` across origins and exposes `ETag` to scripts,
 * both of which this depends on.
 */

import { extractPayload, type PrReportPayload } from 'pr-report-payload';
import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { type ReportSource } from './constants.mjs';

export type LoadedReport = Readonly<{
  payload: PrReportPayload;
  /** The issue it was read from, so the page can link at its own source. */
  issueUrl: string;
  /** Sent back as `If-None-Match` next time; absent if GitHub sent none. */
  etag: string | undefined;
}>;

/**
 * What a conditional request found when the answer was `304`: whatever the
 * caller already has is still current. The caller keeps it — which is safe
 * because an `ETag` is only ever sent for a value that is still on screen.
 */
export const UNCHANGED = 'unchanged';

export type Unchanged = typeof UNCHANGED;

/**
 * What `fetchReport` needs of `globalThis.fetch`, and no more: a route in, an
 * answer out. Everything about *how* to ask belongs to the implementation,
 * which is why the headers are not a parameter.
 *
 * Taken as an argument rather than reached for, so that a test hands in the
 * answer it wants to test against instead of replacing a global and having to
 * put it back — and this repository's lint bans the `afterEach` that would.
 */
export type Fetch = (
  route: string,
  /** The previous answer's `ETag`, when there was one. */
  etag: string | undefined,
) => Promise<Response>;

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
  previousEtag?: string,
  fetchImpl: Fetch = askGitHub,
): Promise<Result<LoadedReport | Unchanged, string>> => {
  const query = new URLSearchParams({
    labels: source.label,
    state: 'open',
    per_page: '1',
  });

  const route =
    `${API_ROOT}/repos/${source.owner}/${source.repo}/issues?${query.toString()}` as const;

  const answered = await request(route, previousEtag, fetchImpl);

  if (Result.isErr(answered)) return answered;

  if (answered.value === UNCHANGED) return Result.ok(UNCHANGED);

  const parsed = Json.parse(answered.value.body);

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

  if (issue === undefined) {
    return Result.err(
      `No open issue labelled \`${source.label}\` in ${source.owner}/${source.repo}. The first run of the PR Report workflow creates it.`,
    );
  }

  const payload = extractPayload(issue.body ?? '');

  return Result.isErr(payload)
    ? payload
    : Result.ok({
        payload: payload.value,
        issueUrl: issue.html_url,
        etag: answered.value.etag,
      });
};

const API_ROOT = 'https://api.github.com';

const NOT_MODIFIED = 304;

/**
 * Only the fields the app reads. `t.record` accepts the rest, which is the
 * whole of what GitHub sends about an issue.
 */
const IssueSchema = t.record({
  html_url: t.string(),
  body: t.union([t.nullType, t.string()]),
});

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
const askGitHub: Fetch = async (route, etag) =>
  fetch(route, {
    // `no-store` so that the browser revalidates nowhere on its own: the
    // conditional request below is this module's, and a cache layer turning a
    // 304 back into a 200 from its own copy would hide the one answer worth
    // telling apart.
    cache: 'no-store',
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(etag === undefined ? {} : { 'If-None-Match': etag }),
    },
  });

type Answer = Readonly<{ body: string; etag: string | undefined }>;

const request = async (
  route: string,
  etag: string | undefined,
  fetchImpl: Fetch,
): Promise<Result<Answer | Unchanged, string>> => {
  const response = await fetchImpl(route, etag).catch(
    (error: unknown) => error,
  );

  if (!(response instanceof Response)) {
    return Result.err(
      'Could not reach the GitHub API. Check the connection and try again.',
    );
  }

  // Answered before `ok`, because a 304 is not `ok` and is not a failure
  // either — it is the whole point of having sent the `ETag`.
  if (response.status === NOT_MODIFIED) return Result.ok(UNCHANGED);

  if (response.ok) {
    return Result.ok({
      body: await response.text(),
      etag: response.headers.get('etag') ?? undefined,
    });
  }

  // The one failure a reader can do something about — wait — without reading
  // the body of the answer. A browser has no token, so the quota is 60 an
  // hour and it belongs to the address rather than to the page.
  return Result.err(
    response.headers.get('x-ratelimit-remaining') === '0'
      ? "GitHub's rate limit for unauthenticated readers is spent. It resets within the hour."
      : `GitHub answered ${response.status} ${response.statusText}.`,
  );
};
