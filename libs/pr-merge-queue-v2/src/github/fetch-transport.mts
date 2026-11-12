/**
 * The reader's transport over `fetch`. Behind a proxy, Node's `fetch` uses it
 * only once told to; a command builds this through `processFetchTransport`
 * (`proxy.mts`), which tells a Node of 25.4 or later.
 */

import type { HttpAnswer, Transport } from 'pr-report-core-v2';
import { unknownToString } from 'ts-data-forge';

/**
 * `fetchFn` as a {@link Transport}: every answer, whatever its status, and a
 * request that got none (a dropped connection, a timeout) as `failed`.
 */
export const fetchTransport =
  (
    fetchFn: typeof fetch,
    options: Readonly<{ timeoutMs: number }> = DEFAULT_OPTIONS,
  ): Transport =>
  async (request) => {
    try {
      const response = await fetchFn(request.url, {
        method: request.method,
        headers: request.headers,
        ...(request.body === undefined ? {} : { body: request.body }),
        // A write is not followed to where a redirect points: a repository
        // renamed, or an issue transferred, since it was read would have it
        // land somewhere not asked for. Answered 3xx, it is refused instead.
        redirect: request.method === 'GET' ? 'follow' : 'manual',
        signal: AbortSignal.timeout(options.timeoutMs),
      });

      return {
        kind: 'answered',
        status: response.status,
        headers: Object.fromEntries(
          Array.from(response.headers, ([name, value]) => [
            name.toLowerCase(),
            value,
          ]),
        ),
        body: await response.text(),
      } satisfies HttpAnswer;
    } catch (error: unknown) {
      return { kind: 'failed', message: unknownToString(error) } as const;
    }
  };

/** Long enough for a slow page of check runs, short enough to be a failure. */
const DEFAULT_OPTIONS = { timeoutMs: 60_000 } as const;
