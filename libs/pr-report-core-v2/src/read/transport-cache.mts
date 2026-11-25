/**
 * Answers kept across reads, so that a poll does not pay again for what it was
 * told already (#4447).
 *
 * - **What cannot change** is answered from what was kept, with no request:
 *   a commit by its sha, a comparison of two shas, and a check run's
 *   annotations, which are read only once it has completed. A request held
 *   back is time saved as well as budget, since a request for an unchanged
 *   answer takes as long as one for a new.
 * - **What can change** is asked again. With `revalidate`, the request carries
 *   the ETag of the answer kept, and GitHub's 304 for an unchanged one, which
 *   it does not charge, is answered with the body kept. A page leaves this off:
 *   the browser revalidates every `GET` itself (`no-cache`), and keeping the
 *   bodies twice would only take memory. A command, whose `fetch` keeps
 *   nothing, turns it on.
 *
 * Nothing else is kept on its sha alone: a head's check runs, statuses and
 * workflow runs gain runs when a workflow is re-run on the same commit, which
 * no other answer says.
 *
 * One cache is made per page or command and handed to every read
 * (`readContextOf`), outside the limit of requests in flight, so that an answer
 * kept waits for no place. Answers are kept by token as well as by URL, since
 * what a token may see is its own.
 */

import type { HttpAnswered, TransportCache } from './transport.mjs';

export const transportCache = ({
  revalidate,
  maxLength = DEFAULT_MAX_LENGTH,
}: Readonly<{
  /** Whether what can change is asked with the ETag of the answer kept. */
  revalidate: boolean;
  /**
   * How much is kept, in characters of answer bodies, the latest used: by size
   * rather than count, since one answer can be a hundred bytes and another a
   * whole diff.
   */
  maxLength?: number;
}>): TransportCache => {
  const mut_kept = new Map<string, Kept>();

  const mut_held = { length: 0 };

  const forget = (key: string): void => {
    mut_held.length -= mut_kept.get(key)?.answer.body.length ?? 0;

    mut_kept.delete(key);
  };

  const keep = (key: string, kept: Kept): void => {
    forget(key);

    mut_kept.set(key, kept);

    mut_held.length += kept.answer.body.length;

    for (const oldest of mut_kept.keys()) {
      if (mut_held.length <= maxLength) {
        break;
      }

      forget(oldest);
    }
  };

  return (transport) => async (request) => {
    if (request.method !== 'GET') {
      return transport(request);
    }

    const key =
      `${request.headers['authorization'] ?? ''} ${request.url}` as const;

    const kept = mut_kept.get(key);

    const fixed = isImmutable(request.url);

    if (kept !== undefined && fixed) {
      keep(key, kept);

      return kept.answer;
    }

    const etag = revalidate ? kept?.etag : undefined;

    const answer = await transport(
      etag === undefined
        ? request
        : {
            ...request,
            headers: { ...request.headers, 'if-none-match': etag },
          },
    );

    if (answer.kind !== 'answered') {
      return answer;
    }

    if (kept !== undefined && answer.status === NOT_MODIFIED) {
      const fresh: HttpAnswered = {
        ...kept.answer,
        // The budget the 304 reports, over what the kept answer said.
        headers: { ...kept.answer.headers, ...answer.headers },
      } as const;

      keep(key, { ...kept, answer: fresh });

      return fresh;
    }

    const newEtag = answer.headers['etag'];

    if (
      answer.status === OK &&
      (fixed || (revalidate && newEtag !== undefined))
    ) {
      keep(key, { answer, etag: newEtag });
    }

    return answer;
  };
};

/**
 * 64 Mi characters: the answers of a few reads of a large repository, check
 * runs and workflow runs at 150 KB a head included.
 */
const DEFAULT_MAX_LENGTH = 64 * 1024 * 1024;

const OK = 200;

const NOT_MODIFIED = 304;

type Kept = Readonly<{ answer: HttpAnswered; etag: string | undefined }>;

/**
 * Whether `url` names an answer that cannot change: a commit by its sha (as a
 * commit or a git commit), a comparison of two shas, or a check run's
 * annotations. Read after the repository's path or its numeric id, which a
 * next-page link uses.
 */
const isImmutable = (url: string): boolean => {
  const { pathname } = new URL(url);

  return IMMUTABLE.test(pathname);
};

const SHA = '[0-9a-f]{40}';

const IMMUTABLE = new RegExp(
  `/(?:commits/${SHA}|git/commits/${SHA}|compare/${SHA}\\.\\.\\.${SHA}|check-runs/\\d+/annotations)$`,
  'u',
);
