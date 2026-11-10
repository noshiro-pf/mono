/**
 * A {@link Transport} that answers from recorded answers by URL, for tests of
 * every reader (and of what is built on them) without a server.
 */

import { Arr, hasKey } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { HttpAnswer, HttpRequest, Transport } from './transport.mjs';

/**
 * Answers each request with the answer recorded for its URL, path and query
 * after `https://api.github.com` (or `POST /graphql` with the first route whose
 * key the body's query contains); an unrecorded one fails, naming it. `sent`
 * lists what was asked, in order.
 */
export const recordedTransport = (
  routes: ReadonlyRecord<string, HttpAnswer | readonly HttpAnswer[]>,
): Readonly<{ transport: Transport; sent: readonly HttpRequest[] }> => {
  const mut_sent: HttpRequest[] = [];

  const mut_served = new Map<string, number>();

  const transport: Transport = (request) => {
    mut_sent.push(request);

    const key = keyOf(request, routes);

    const recorded = key === undefined ? undefined : routes[key];

    const served = mut_served.get(key ?? '') ?? 0;

    mut_served.set(key ?? '', served + 1);

    const answer =
      recorded === undefined
        ? undefined
        : isAnswerList(recorded)
          ? recorded[served]
          : recorded;

    return Promise.resolve(
      answer ?? {
        kind: 'failed',
        message: `no answer recorded for ${request.method} ${request.url}`,
      },
    );
  };

  return { transport, sent: mut_sent };
};

/** A 200 with `body` as JSON. */
export const ok = (
  body: unknown,
  headers: ReadonlyRecord<string, string> = {},
): HttpAnswer =>
  ({
    kind: 'answered',
    status: 200,
    headers,
    body: JSON.stringify(body),
  }) as const;

/** An error status with GitHub's `message`. */
export const status = (
  code: number,
  message: string,
  headers: ReadonlyRecord<string, string> = {},
): HttpAnswer =>
  ({
    kind: 'answered',
    status: code,
    headers,
    body: JSON.stringify({ message }),
  }) as const;

const API = 'https://api.github.com';

const isAnswerList = (
  recorded: HttpAnswer | readonly HttpAnswer[],
): recorded is readonly HttpAnswer[] => Arr.isArray(recorded);

const keyOf = (
  request: HttpRequest,
  routes: ReadonlyRecord<string, unknown>,
): string | undefined => {
  if (request.method === 'POST') {
    return Object.keys(routes).find(
      (key) =>
        key.startsWith('graphql:') &&
        (request.body ?? '').includes(key.slice('graphql:'.length)),
    );
  }

  const path = request.url.startsWith(API)
    ? request.url.slice(API.length)
    : request.url;

  return hasKey(routes, path) ? path : undefined;
};
