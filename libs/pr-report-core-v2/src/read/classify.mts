/**
 * Why an answer is not the facts asked for (`snapshot/read-result.mts`,
 * `ReadError`), decided in one place for every reader so that the page and the
 * commands call the same failure by the same name.
 */

import { Arr, hasKey, isRecord, Json, Result } from 'ts-data-forge';
import type { ReadError } from '../snapshot/index.mjs';
import type { HttpAnswered } from './transport.mjs';

/**
 * The {@link ReadError} an HTTP answer stands for, or `undefined` for a 2xx.
 * The rate limits answer 429, or 403 told from a refusal by `retry-after` or
 * `x-ratelimit-remaining: 0`; a 408 is a timeout, which may pass when asked
 * again, as a 5xx may. Only `refused` goes on being refused.
 */
export const classifyHttp = (
  what: string,
  answer: HttpAnswered,
): ReadError | undefined => {
  const { status, headers } = answer;

  if (200 <= status && status < 300) {
    return undefined;
  }

  const message = `${status}: ${messageOf(answer.body)}` as const;

  if (
    status === 429 ||
    (status === 403 &&
      (headers['retry-after'] !== undefined ||
        headers['x-ratelimit-remaining'] === '0'))
  ) {
    return { kind: 'rate-limited', what, message };
  }

  return status === 408 || status >= 500
    ? { kind: 'unavailable', what, message }
    : { kind: 'refused', what, message };
};

/**
 * The {@link ReadError} a GraphQL `errors` list stands for, or `undefined` when
 * it is empty: `RATE_LIMITED` passes, `FORBIDDEN` and `NOT_FOUND` are what REST
 * answers 403 and 404 for, anything else is an answer nobody expected.
 */
export const classifyGraphqlErrors = (
  what: string,
  errors: readonly Readonly<{ type: string | undefined; message: string }>[],
): ReadError | undefined => {
  if (!Arr.isNonEmpty(errors)) {
    return undefined;
  }

  const message = errors.map((error) => error.message).join('; ');

  return errors.some(({ type }) => type === 'RATE_LIMITED')
    ? { kind: 'rate-limited', what, message }
    : errors.every(({ type }) => type === 'FORBIDDEN' || type === 'NOT_FOUND')
      ? { kind: 'refused', what, message }
      : { kind: 'malformed', what, message };
};

/** Whether a read was refused as not found (a 404), which some reads mean none. */
export const isNotFound = (error: ReadError): boolean =>
  error.kind === 'refused' && error.message.startsWith('404:');

/**
 * Whether a read was refused as gone (a 410): an issue deleted, or every issue
 * of a repository whose issues are turned off.
 */
export const isGone = (error: ReadError): boolean =>
  error.kind === 'refused' && error.message.startsWith('410:');

/** No answer at all: a dropped connection, a timeout. */
export const unanswered = (what: string, message: string): ReadError =>
  ({ kind: 'unavailable', what, message }) as const;

/** An answer of a shape nobody expected. */
export const malformed = (what: string, message: string): ReadError =>
  ({
    kind: 'malformed',
    what,
    message,
  }) as const;

/** A part this reader does not offer at all, and why. */
export const skipped = (what: string, message: string): ReadError =>
  ({
    kind: 'skipped',
    what,
    message,
  }) as const;

/** GitHub's own `message`, or the start of the body (a proxy's HTML page). */
const messageOf = (body: string): string => {
  const parsed = Json.parse(body);

  return Result.isOk(parsed) &&
    isRecord(parsed.value) &&
    hasKey(parsed.value, 'message') &&
    typeof parsed.value.message === 'string'
    ? parsed.value.message
    : body.slice(0, 200);
};
