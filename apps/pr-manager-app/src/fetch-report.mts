/**
 * Reading the reports back out of the issues that write them.
 *
 * Two requests a load: the issue `pr-report.yml` writes, and the one
 * `unblock-prs` writes when it acts on something. Asking GitHub about the
 * pull requests directly is what this cannot afford — three requests each,
 * against the 60 an hour an anonymous browser is allowed for the whole
 * address it sits behind. Both reports did that work already, one in a job
 * that holds a token and one on somebody's terminal.
 *
 * **Every request is conditional**, and it is worth being exact about what
 * that buys, because the answer depends on who is asking. Sending an `ETag`
 * back as `If-None-Match` gets a `304` that costs nothing against the quota
 * *for an authenticated caller* — measured, `x-ratelimit-remaining`
 * unchanged across four of them. **An anonymous caller is charged for the
 * 304 as well** — measured on the same endpoint minutes later, 59, 58, 57
 * across three. So the header is worth sending either way, for the transfer
 * it saves; what it does *not* do is buy a shorter interval for a page with
 * no token, and `pollIntervalMs` is where that is decided.
 *
 * The three things this depends on GitHub doing across origins, all
 * measured against `api.github.com` from a `noshiro-pf.github.io` origin:
 * it accepts `If-None-Match` and `Authorization` (both named in
 * `Access-Control-Allow-Headers`), it exposes `ETag` and the
 * `X-RateLimit-*` headers to scripts, and it does both **on the `304` as
 * well as on the `200`** — a 304 that answered no `Access-Control-Allow-
 * Origin` would be dropped by the browser before this code saw it. The
 * preflight those headers force is answered with `Access-Control-Max-Age:
 * 86400` and is not charged against the rate limit, so it costs one request
 * a day rather than one per poll.
 */

import {
  extractPayload,
  extractRunLog,
  type PrReportPayload,
  type UnblockPrsLog,
} from 'pr-report-payload';
import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { type ReadonlyRecord } from 'ts-type-forge';
import { type ReportSource } from './constants.mjs';
import { readRateLimit, type RateLimit } from './rate-limit.mjs';

export type LoadedReport = Readonly<{
  payload: PrReportPayload;
  /** The issue it was read from, so the page can link at its own source. */
  issueUrl: string;
  /** Sent back as `If-None-Match` next time; absent if GitHub sent none. */
  etag: string | undefined;
}>;

export type LoadedRunLog = Readonly<{
  log: UnblockPrsLog;
  issueUrl: string;
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
 * What the caller has to say to ask, gathered into one argument rather than
 * a row of positional ones that would read the same at the call site whether
 * or not they were in the right order.
 */
export type ReadRequest = Readonly<{
  /** The previous answer's `ETag`, when there was one. */
  etag: string | undefined;
  /**
   * The reader's token, when they have given one. Never a build-time value:
   * a token compiled into this bundle would be published with it.
   */
  token: string | undefined;
  /**
   * The network. Taken as an argument rather than reached for, so that a
   * test hands in the answer it wants to test against instead of replacing a
   * global and having to put it back — and this repository's lint bans the
   * `afterEach` that would.
   */
  fetchImpl?: Fetch;
}>;

/**
 * What these functions need of `globalThis.fetch`, and no more.
 *
 * The shape of `fetch` itself rather than something narrower, so that what a
 * test is handed is the request that would have gone out — headers included.
 * A `Fetch` taking an ETag and a token instead would leave the one line that
 * turns them into headers as the one line no test ever reads, which is where
 * an `Authorization` that never got sent would hide.
 */
export type Fetch = (route: string, init: FetchInit) => Promise<Response>;

/**
 * The request as this module builds it, and as `fetch` is handed it. Its own
 * type rather than `RequestInit` so that a test can read a header without an
 * assertion: `HeadersInit` is three shapes, only one of which is ever used
 * here.
 */
export type FetchInit = Readonly<{
  cache: RequestCache;
  headers: ReadonlyRecord<string, string>;
}>;

/**
 * An answer and what it said about the budget.
 *
 * The budget is reported beside the result rather than inside it because a
 * `304` and a refusal both carry it, and those are exactly the answers a
 * reader wants the number for.
 */
export type Answered<T> = Readonly<{
  result: Result<T | Unchanged, string>;
  /** Absent when the answer named no limit, as a cached one would not. */
  rateLimit: RateLimit | undefined;
}>;

/**
 * The report, or a sentence a reader can act on.
 *
 * Every failure is a failure in front of someone, so none of them is a stack
 * trace: an issue that is not there yet, a quota spent, a token GitHub will
 * not take, a body written by a `pr-report` of a different age.
 * {@link extractPayload} words the last of those; this words the ones that
 * happen before there is a body to read.
 */
export const fetchReport = async (
  source: ReportSource,
  request: ReadRequest,
): Promise<Answered<LoadedReport>> => {
  const { result, rateLimit } = await fetchLabelledIssue(
    source,
    source.label,
    request,
  );

  return { rateLimit, result: readIssue(result, extractPayload, payloadOf) };
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
  request: ReadRequest,
): Promise<Answered<LoadedRunLog>> => {
  const { result, rateLimit } = await fetchLabelledIssue(
    source,
    source.runLogLabel,
    request,
  );

  return { rateLimit, result: readIssue(result, extractRunLog, logOf) };
};

const API_ROOT = 'https://api.github.com';

const NOT_MODIFIED = 304;

const UNAUTHORIZED = 401;

type FoundIssue = Issue & Readonly<{ etag: string | undefined }>;

/** The one open issue carrying a label, or a sentence saying why not. */
const fetchLabelledIssue = async (
  source: ReportSource,
  label: string,
  request: ReadRequest,
): Promise<Answered<FoundIssue>> => {
  const query = new URLSearchParams({
    labels: label,
    state: 'open',
    per_page: '1',
  });

  const route =
    `${API_ROOT}/repos/${source.owner}/${source.repo}/issues?${query.toString()}` as const;

  const answered = await ask(route, request);

  const { rateLimit } = answered;

  if (Result.isErr(answered.result)) {
    return { rateLimit, result: answered.result };
  }

  if (answered.result.value === UNCHANGED) {
    return { rateLimit, result: Result.ok(UNCHANGED) };
  }

  const found = firstIssue(answered.result.value);

  return {
    rateLimit,
    result: Result.isErr(found)
      ? Result.err(
          found.value === NONE
            ? `No open issue labelled \`${label}\` in ${source.owner}/${source.repo} yet.`
            : found.value,
        )
      : found,
  };
};

/** Told apart from a real parse failure so the label can be named. */
const NONE = 'none';

const firstIssue = (answer: Answer): Result<FoundIssue, string> => {
  const parsed = Json.parse(answer.body);

  if (Result.isErr(parsed)) {
    return Result.err(`GitHub did not answer JSON: ${parsed.value}`);
  }

  const validated = IssueListSchema.validate(parsed.value);

  if (Result.isErr(validated)) {
    return Result.err(
      `GitHub answered an unexpected shape:\n${t.validationErrorsToMessages(validated.value).join('\n')}`,
    );
  }

  const found = validated.value[0];

  return found === undefined
    ? Result.err(NONE)
    : Result.ok({ ...found, etag: answer.etag });
};

/**
 * The half the two readers share: a `304` is passed through untouched, and
 * anything else has its body handed to whichever extractor knows the block.
 */
const readIssue = <T, U>(
  found: Result<FoundIssue | Unchanged, string>,
  extract: (body: string) => Result<T, string>,
  assemble: (value: T, from: FoundIssue) => U,
): Result<U | Unchanged, string> => {
  if (Result.isErr(found)) return found;

  if (found.value === UNCHANGED) return Result.ok(UNCHANGED);

  const issue = found.value;

  const extracted = extract(issue.body ?? '');

  return Result.isErr(extracted)
    ? extracted
    : Result.ok(assemble(extracted.value, issue));
};

const payloadOf = (payload: PrReportPayload, issue: FoundIssue): LoadedReport =>
  ({ payload, issueUrl: issue.html_url, etag: issue.etag }) as const;

const logOf = (log: UnblockPrsLog, issue: FoundIssue): LoadedRunLog =>
  ({ log, issueUrl: issue.html_url, etag: issue.etag }) as const;

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
 * Written as a wrapper rather than handed over bare, because `fetch`
 * detached from the global it belongs to is not callable in every engine.
 */
const askGitHub: Fetch = async (route, init) => fetch(route, init);

/**
 * `Bearer` rather than `token` because both fine-grained and classic
 * personal access tokens are accepted under it, and the panel that collects
 * one recommends whichever is weaker.
 */
const requestInit = (
  etag: string | undefined,
  token: string | undefined,
): FetchInit => ({
  // `no-store` so that the browser does its own revalidation nowhere: the
  // conditional request here is this module's, and a cache layer turning a
  // 304 back into a 200 from its own copy would hide the one answer worth
  // telling apart.
  cache: 'no-store',
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(etag === undefined ? {} : { 'If-None-Match': etag }),
    ...(token === undefined ? {} : { Authorization: `Bearer ${token}` }),
  },
});

type Answer = Readonly<{ body: string; etag: string | undefined }>;

const ask = async (
  route: string,
  request: ReadRequest,
): Promise<Answered<Answer>> => {
  const { etag, token, fetchImpl = askGitHub } = request;

  const response = await fetchImpl(route, requestInit(etag, token)).catch(
    (error: unknown) => error,
  );

  if (!(response instanceof Response)) {
    return {
      rateLimit: undefined,
      result: Result.err(
        'Could not reach the GitHub API. Check the connection and try again.',
      ),
    };
  }

  const rateLimit = readRateLimit(response.headers);

  // Answered before `ok`, because a 304 is not `ok` and is not a failure
  // either — it is the whole point of having sent the `ETag`.
  if (response.status === NOT_MODIFIED) {
    return { rateLimit, result: Result.ok(UNCHANGED) };
  }

  if (response.ok) {
    return {
      rateLimit,
      result: Result.ok({
        body: await response.text(),
        etag: response.headers.get('etag') ?? undefined,
      }),
    };
  }

  return { rateLimit, result: Result.err(refusal(response, token)) };
};

/**
 * The refusals a reader can do something about, said in terms of the thing
 * they would do. The rest are given by their status, which is at least
 * something to search for.
 */
const refusal = (response: Response, token: string | undefined): string => {
  if (response.status === UNAUTHORIZED) {
    return 'GitHub would not accept the token. It may have expired or been revoked — clear it below, or paste a new one.';
  }

  if (response.headers.get('x-ratelimit-remaining') === '0') {
    return token === undefined
      ? "GitHub's rate limit for readers without a token is spent. It is 60 an hour for everyone sharing this address, and it resets within the hour. A token of your own lifts it to 5,000."
      : "The rate limit on this token's account is spent. It resets within the hour.";
  }

  return `GitHub answered ${response.status} ${response.statusText}.`;
};
