/**
 * What a reader sends and gets back, with the sending injected: the page passes
 * `fetch`, a command passes `fetch` through its proxy, and a test passes
 * recorded answers. Nothing here knows which.
 */

import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * Who is asked, as whom: built by {@link readContextOf}, which holds the
 * requests in flight to a limit.
 */
export type ReadContext = Readonly<{
  transport: Transport;
  /**
   * The repository as GitHub names it now (`RepositoryFacts.repo`): a renamed
   * one still answers its old name, but every answer names the new, and an
   * issue naming another repository is read as transferred away.
   */
  owner: string;
  name: string;
  /** `undefined` reads anonymously, which the rate limits make small. */
  token: string | undefined;
}>;

/**
 * Sends one request. A request that got no answer at all (a dropped connection,
 * a timeout) resolves to a `failed` answer, never rejects.
 */
export type Transport = (request: HttpRequest) => Promise<HttpAnswer>;

/** One request to GitHub. */
export type HttpRequest = Readonly<{
  method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
  url: string;
  headers: ReadonlyRecord<string, string>;
  body: string | undefined;
}>;

/** An answer, its header names lower case, or why there was none. */
export type HttpAnswer =
  HttpAnswered | Readonly<{ kind: 'failed'; message: string }>;

/** An answer that came, whatever its status. */
export type HttpAnswered = Readonly<{
  kind: 'answered';
  status: number;
  headers: ReadonlyRecord<string, string>;
  body: string;
}>;

/**
 * The context every reader is handed, its requests kept to
 * {@link CONCURRENT_REQUESTS} in flight. Built once, by whoever holds the
 * transport, so that every read made through it shares the one limit; a reader
 * does not limit again.
 */
export const readContextOf = (
  parts: Readonly<{
    transport: Transport;
    owner: string;
    name: string;
    token: string | undefined;
  }>,
): ReadContext =>
  ({
    ...parts,
    transport: limitConcurrency(parts.transport, CONCURRENT_REQUESTS),
  }) as const;

/**
 * How many requests a reader keeps in flight: each open pull request fans out
 * to a dozen reads, and GitHub's secondary limit refuses a burst of them.
 */
export const CONCURRENT_REQUESTS = 8;

/**
 * `transport`, with at most `limit` requests in flight: the rest wait, in the
 * order sent, for one to be answered.
 */
export const limitConcurrency = (
  transport: Transport,
  limit: number,
): Transport => {
  if (!Number.isSafeInteger(limit) || limit < 1) {
    // Nothing in flight would ever free a place: every request would wait.
    throw new RangeError(`a concurrency limit of ${limit}`);
  }

  const mut_waiting: (() => void)[] = [];

  let mut_inFlight = 0;

  const release = (): void => {
    mut_inFlight -= 1;

    mut_waiting.shift()?.();
  };

  const turn = (): Promise<void> => {
    if (mut_inFlight < limit) {
      mut_inFlight += 1;

      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      mut_waiting.push(() => {
        mut_inFlight += 1;

        resolve();
      });
    });
  };

  return async (request) => {
    await turn();

    try {
      return await transport(request);
    } finally {
      release();
    }
  };
};
