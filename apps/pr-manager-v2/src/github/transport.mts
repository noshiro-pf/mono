import type { HttpAnswer, HttpRequest, Transport } from 'pr-report-core-v2';
import { hasKey, isRecord } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { RateLimit } from '../domain/index.mjs';

/**
 * The page's {@link Transport}: `fetch`, as `pr-report-core-v2`'s readers ask.
 *
 * - GraphQL goes out as `no-store`, since every query is a POST with a new
 *   answer. A `GET` goes out as `no-cache`: the browser revalidates what it
 *   kept, and GitHub does not charge a 304, which is what keeps the REST parts
 *   of every read affordable.
 * - A request with no answer after {@link TIMEOUT_MS} is a failed answer, as
 *   the transport contract has it, so that a stalled connection cannot hold the
 *   read waiting on it.
 * - Every answer's rate-limit headers go to `onBudget`, by resource, which is
 *   what paces the poll.
 */
export const browserTransport = (
  onBudget: (resource: string, limit: RateLimit) => void,
  fetchImpl: Fetch = browserFetch,
): Transport => {
  const transport: Transport = async (request) => {
    const answer = await fetchImpl(request.url, {
      method: request.method,
      headers: request.headers,
      ...(request.body === undefined ? {} : { body: request.body }),
      cache: request.method === 'GET' ? 'no-cache' : 'no-store',
      timeoutMs: TIMEOUT_MS,
    }).catch((error: unknown) => failed(error));

    if (answer.kind === 'failed') {
      return answer;
    }

    const budget = rateLimitOf(answer.headers);

    if (budget !== undefined) {
      onBudget(budget.resource, budget.limit);
    }

    return answer;
  };

  return transport;
};

/**
 * The resource and budget an answer's headers report, or `undefined` when a
 * header is missing or not a number.
 */
export const rateLimitOf = (
  headers: ReadonlyRecord<string, string>,
): Readonly<{ resource: string; limit: RateLimit }> | undefined => {
  const remaining = Number(headers['x-ratelimit-remaining']);

  const limit = Number(headers['x-ratelimit-limit']);

  const reset = Number(headers['x-ratelimit-reset']);

  const resource = headers['x-ratelimit-resource'] ?? 'core';

  return [remaining, limit, reset].every(Number.isFinite) &&
    headers['x-ratelimit-remaining'] !== undefined
    ? { resource, limit: { remaining, limit, resetAtMs: reset * 1000 } }
    : undefined;
};

/**
 * `fetch` as the transport uses it, answering with the headers' names lower
 * case and the body read; injected so a test needs no network.
 */
export type Fetch = (url: string, init: FetchInit) => Promise<HttpAnswer>;

export type FetchInit = Readonly<{
  method: HttpRequest['method'];
  headers: ReadonlyRecord<string, string>;
  body?: string;
  cache: RequestCache;
  timeoutMs: number;
}>;

/** How long a request may go unanswered before it counts as failed. */
export const TIMEOUT_MS = 30_000;

const browserFetch: Fetch = async (url, init) => {
  const response = await globalThis.fetch(url, {
    method: init.method,
    headers: init.headers,
    ...(init.body === undefined ? {} : { body: init.body }),
    cache: init.cache,
    signal: AbortSignal.timeout(init.timeoutMs),
  });

  // Read inside the same signal: a body that stalls is a failure too.
  const body = await response.text();

  return {
    kind: 'answered',
    status: response.status,
    headers: Object.fromEntries(
      Array.from(response.headers, ([name, value]) => [
        name.toLowerCase(),
        value,
      ]),
    ),
    body,
  };
};

const failed = (error: unknown): HttpAnswer =>
  ({
    kind: 'failed',
    message:
      isRecord(error) &&
      hasKey(error, 'message') &&
      typeof error.message === 'string'
        ? error.message
        : ('the request failed' as const),
  }) as const;
