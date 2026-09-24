/**
 * One request to GitHub's GraphQL API, and every way it can go wrong worded
 * for the reader of the page.
 *
 * GraphQL rather than REST because of how each one charges. REST charges a
 * request, and reading one pull request takes three of them — the comparison
 * against its base and the two kinds of check — so a page that polled
 * twenty pull requests over REST would spend 5,000 an hour in well under an
 * hour. GraphQL charges a query by the size of what it asks for, and one
 * query asks for every open pull request at once: measured against this
 * repository, 4 points for the whole report.
 *
 * What it costs is the token. GraphQL answers nobody without one, which is
 * why the page asks for one before it reads anything.
 *
 * The things this depends on GitHub doing across origins, all measured from
 * a `noshiro-pf.github.io` origin: the endpoint answers the preflight with
 * `Access-Control-Allow-Origin: *` and allows `Authorization`, and it exposes
 * the `X-RateLimit-*` headers to scripts, which here describe the GraphQL
 * budget rather than the REST one.
 */

import { Arr, isRecord, Json, Obj, Result } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { readRateLimit, type RateLimit } from './rate-limit.mjs';

/** What these functions need of `globalThis.fetch`, and no more. */
export type Fetch = (route: string, init: FetchInit) => Promise<Response>;

/**
 * The request as this module builds it, and as `fetch` is handed it. Its own
 * type rather than `RequestInit` so that a test can read a header or the body
 * without an assertion.
 */
export type FetchInit = Readonly<{
  method: 'POST';
  cache: RequestCache;
  headers: ReadonlyRecord<string, string>;
  body: string;
}>;

export type GraphqlRequest = Readonly<{
  query: string;
  variables: ReadonlyRecord<string, unknown>;
  /**
   * The reader's token. Never a build-time value: a token compiled into this
   * bundle would be published with it.
   */
  token: string;
  /**
   * The network. Taken as an argument rather than reached for, so that a
   * test hands in the answer it wants to test against instead of replacing a
   * global and having to put it back.
   */
  fetchImpl?: Fetch;
}>;

/**
 * An answer and what it said about the budget.
 *
 * The budget is reported beside the result rather than inside it because a
 * refusal carries it too, and a refusal is exactly when a reader wants the
 * number.
 */
export type Answered<T> = Readonly<{
  result: Result<T, string>;
  rateLimit: RateLimit | undefined;
}>;

/**
 * What a query answered: its `data`, and the errors GitHub reported beside
 * it. Both at once, because GraphQL answers a query that partly failed with
 * `200`, the parts it could answer, and a list of the parts it could not —
 * and only the caller knows which parts it can do without.
 */
export type GraphqlAnswer = Readonly<{
  data: unknown;
  errors: readonly GraphqlError[];
}>;

export type GraphqlError = Readonly<{
  message: string;
  /** Where in the query it happened, starting from the top-level alias. */
  path: readonly (number | string)[];
}>;

const GRAPHQL_URL = 'https://api.github.com/graphql';

/**
 * Asks, and turns every answer that is not data into a sentence.
 *
 * A query that GitHub refused outright — a `data` of `null` — is a failure
 * here, with GitHub's own words. One that came back with data and some
 * errors is not: that is the caller's to judge.
 */
export const askGraphql = async (
  request: GraphqlRequest,
): Promise<Answered<GraphqlAnswer>> => {
  const { query, variables, token, fetchImpl = askGitHub } = request;

  const response = await fetchImpl(GRAPHQL_URL, {
    method: 'POST',
    // Nothing here is worth a cached copy: each read is a question about now.
    cache: 'no-store',
    headers: {
      // `Bearer` rather than `token`, because both fine-grained and classic
      // personal access tokens are accepted under it.
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  }).catch((error: unknown) => error);

  if (!(response instanceof Response)) {
    return {
      rateLimit: undefined,
      result: Result.err(
        'Could not reach the GitHub API. Check the connection and try again.',
      ),
    };
  }

  const rateLimit = readRateLimit(response.headers);

  if (!response.ok) {
    return { rateLimit, result: Result.err(refusal(response)) };
  }

  const parsed = Json.parse(await response.text());

  if (Result.isErr(parsed) || !isRecord(parsed.value)) {
    return {
      rateLimit,
      result: Result.err('GitHub answered with something that is not JSON.'),
    };
  }

  const data: unknown = withoutNullNodes(parsed.value['data'] ?? null);

  const errors = readErrors(parsed.value['errors']);

  if (data === null) {
    return {
      rateLimit,
      result: Result.err(
        Arr.isNonEmpty(errors)
          ? `GitHub refused the query: ${errors.map(({ message }) => message).join(' ')}`
          : 'GitHub answered the query with nothing.',
      ),
    };
  }

  return { rateLimit, result: Result.ok({ data, errors }) };
};

/**
 * The answer with `null` taken out of every `nodes` list.
 *
 * GraphQL puts a `null` in a list for an item the token may not see, rather
 * than leaving it out — a pull request here closes an issue in a private
 * repository, and a token with no scopes gets `null` where that issue would
 * be. Nothing on this page can show an item it was not allowed to read, so it
 * is dropped here, once, instead of every schema and every reader having to
 * allow for it. Only `nodes`: a `null` anywhere else is a value the schema has
 * something to say about.
 */
export const withoutNullNodes = (value: unknown): unknown => {
  if (Arr.isArray(value)) return value.map(withoutNullNodes);

  if (!isRecord(value)) return value;

  return Obj.map(value, (field, key) =>
    key === 'nodes' && Arr.isArray(field)
      ? field.filter((node) => node !== null).map(withoutNullNodes)
      : withoutNullNodes(field),
  );
};

/**
 * Written as a wrapper rather than handed over bare, because `fetch`
 * detached from the global it belongs to is not callable in every engine.
 */
const askGitHub: Fetch = async (route, init) => fetch(route, init);

const UNAUTHORIZED = 401;

/**
 * The refusals a reader can do something about, said in terms of the thing
 * they would do. The rest are given by their status, which is at least
 * something to search for.
 */
const refusal = (response: Response): string =>
  response.status === UNAUTHORIZED
    ? 'GitHub would not accept the token. It may have expired or been revoked — clear it below, or paste a new one.'
    : response.headers.get('x-ratelimit-remaining') === '0'
      ? "The GraphQL rate limit on this token's account is spent. It resets within the hour."
      : (`GitHub answered ${response.status} ${response.statusText}.` as const);

const readErrors = (value: unknown): readonly GraphqlError[] =>
  Arr.isArray(value)
    ? value.flatMap((error) =>
        isRecord(error) && typeof error['message'] === 'string'
          ? [
              {
                message: error['message'],
                path: Arr.isArray(error['path'])
                  ? error['path'].filter(
                      (step): step is number | string =>
                        typeof step === 'number' || typeof step === 'string',
                    )
                  : [],
              },
            ]
          : [],
      )
    : ([] as const);
