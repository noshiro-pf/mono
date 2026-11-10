/**
 * How the report reads a JSON answer from GitHub's REST API: the default
 * branch's rules and activity (`branch-rules.mts`), the workflow runs still
 * going (`workflow-runs.mts`) and the runs on the queue layers
 * (`layer-runs.mts`). `no-cache`, so that the answer the browser kept is
 * revalidated and a `304` costs nothing — which is most reads but the first.
 */

import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReadonlyRecord } from 'ts-type-forge';
import { askAndRead, unreachable } from './answer-body.mjs';

/**
 * A REST answer of `route` as `schema` has it, or a sentence a reader can act
 * on that names `what` was asked for, revalidated rather than refetched as the
 * top of this file says.
 */
export const getJson = async <A,>(
  route: string,
  schema: t.Type<A>,
  what: string,
  token: string,
  fetchImpl: RestFetch,
): Promise<Result<A, string>> => {
  const answered = await askAndRead(
    async (again) =>
      fetchImpl(route, {
        method: 'GET',
        // Revalidated rather than refetched: see the top of this file. Asked
        // again, it is the cached body that was bad.
        cache: again ? 'reload' : 'no-cache',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }),
    what,
  );

  if (answered === undefined) {
    return Result.err(unreachable(what));
  }

  const { response, body: parsed } = answered;

  if (!response.ok) {
    return Result.err(refusal(response, what));
  }

  if (parsed === undefined || Result.isErr(parsed)) {
    return parsed ?? Result.err('GitHub sent no body.');
  }

  const validated = schema.validate(parsed.value);

  return Result.isErr(validated)
    ? Result.err(
        `GitHub's answer for ${what} is not the shape this page expects:\n${t.validationErrorsToMessages(validated.value).join('\n')}`,
      )
    : Result.ok(validated.value);
};

/**
 * Written as a wrapper rather than handed over bare, because `fetch` detached
 * from the global it belongs to is not callable in every engine.
 */
export const askGitHub: RestFetch = async (route, init) => fetch(route, init);

/**
 * Why GitHub refused to answer a REST read of `what`, in a sentence a reader
 * can act on.
 */
const refusal = (response: Response, what: string): string =>
  response.status === UNAUTHORIZED
    ? (`GitHub would not accept the token for ${what}. It may have expired or been revoked.` as const)
    : response.headers.get('x-ratelimit-remaining') === '0'
      ? (`The REST rate limit on this token's account is spent, so ${what} cannot be read. It resets within the hour.` as const)
      : (`GitHub answered ${response.status} ${response.statusText} for ${what}.` as const);

/** What these functions need of `globalThis.fetch`, and no more. */
export type RestFetch = (
  route: string,
  init: RestFetchInit,
) => Promise<Response>;

/** Its own type, as `FetchInit` is in `graphql.mts`, so a test can read it. */
export type RestFetchInit = Readonly<{
  method: 'GET';
  cache: RequestCache;
  headers: ReadonlyRecord<string, string>;
}>;

const UNAUTHORIZED = 401;
