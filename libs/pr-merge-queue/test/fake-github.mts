/**
 * A fake GitHub on a local port, for a test of what `createClient`'s readers
 * ask and make of the answers. Every route the readers ask is answered with the
 * smallest answer of the right shape — one open pull request, #1, onto `main`,
 * and nothing else open, merged, reported or commented — unless the test
 * answers it itself.
 */

import { createServer } from 'node:http';
import type { ReadonlyRecord } from 'ts-type-forge';

/** The one open pull request, as the open list answers it. */
export const fakePullRequest = (
  overrides: ReadonlyRecord<string, unknown> = {},
): ReadonlyRecord<string, unknown> =>
  ({
    number: 1,
    title: 'A pull request',
    body: 'No keyword here.',
    draft: false,
    html_url: `https://github.com/${FAKE_REPO.owner}/${FAKE_REPO.name}/pull/1`,
    updated_at: '2026-01-01T00:00:00Z',
    user: { login: 'someone' },
    labels: [],
    merged_at: null,
    auto_merge: null,
    head: {
      ref: 'b',
      sha: FAKE_HEAD_SHA,
      repo: { full_name: `${FAKE_REPO.owner}/${FAKE_REPO.name}` },
    },
    base: { ref: 'main' },
    ...overrides,
  }) as const;

/**
 * `main` requiring one context, and the check run of that name failed on every
 * head: the routes that make a pull request's verdict `failing` once its checks
 * are read.
 */
export const failingRequiredCheck: FakeRoutes = ({ url }) => {
  if (url.includes('/rules/branches/')) {
    return {
      body: [
        {
          type: 'required_status_checks',
          parameters: {
            required_status_checks: [{ context: FAKE_REQUIRED_CONTEXT }],
          },
        },
      ],
    };
  }

  if (url.includes('/check-runs')) {
    return {
      body: {
        total_count: 1,
        check_runs: [
          {
            id: 1,
            check_suite: { id: 1 },
            name: FAKE_REQUIRED_CONTEXT,
            status: 'completed',
            conclusion: 'failure',
            completed_at: '2026-01-01T00:00:00Z',
          },
        ],
      },
    };
  }

  return undefined;
};

/** Which of {@link FAKE_CHECK_ROUTES} `requested` asked, in their order. */
export const checkRoutesAsked = (
  requested: readonly string[],
): readonly string[] =>
  FAKE_CHECK_ROUTES.filter((route) =>
    requested.some((path) => path.includes(route)),
  );

/** Starts a fake GitHub that answers `routes` first, then the defaults. */
export const fakeGitHub = async (
  routes: FakeRoutes = () => undefined,
): Promise<FakeGitHub> => {
  const mut_requested: string[] = [];

  const server = createServer((request, response) => {
    const url = request.url ?? '/';

    mut_requested.push(url);

    const mut_chunks: Buffer[] = [];

    request.on('data', (chunk: unknown) => {
      if (Buffer.isBuffer(chunk)) {
        mut_chunks.push(chunk);
      } else if (typeof chunk === 'string') {
        mut_chunks.push(Buffer.from(chunk, 'utf8'));
      }
    });

    request.on('end', () => {
      const body = Buffer.concat(mut_chunks).toString('utf8');

      const answer =
        routes({
          url,
          accept: request.headers.accept,
          body: body === '' ? undefined : body,
        }) ?? defaultAnswer(url);

      response.writeHead(answer.status ?? 200, {
        'content-type': 'application/json',
      });

      response.end(JSON.stringify(answer.body));
    });
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();

  // A string only for a server listening on a pipe, which this one is not.
  if (address === null || typeof address === 'string') {
    throw new Error('the fake GitHub is not listening on a port');
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    requested: mut_requested,
    close: async () => {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    },
  };
};

export type FakeGitHub = Readonly<{
  /** What to give `createClient` as its `baseUrl`. */
  baseUrl: string;
  /** The path and query of every request so far, in the order sent. */
  requested: readonly string[];
  close: () => Promise<void>;
}>;

/** An answer: JSON for `body`, sent with `status`, 200 when not given. */
export type FakeAnswer = Readonly<{ status?: number; body: unknown }>;

/**
 * What a test is told of a request: its path and query, its media type, and the
 * body it sent (`undefined` for a GET).
 */
export type FakeRequest = Readonly<{
  url: string;
  accept: string | undefined;
  body: string | undefined;
}>;

/**
 * The answer to a request a test answers itself, or `undefined` to leave it to
 * the default.
 */
export type FakeRoutes = (request: FakeRequest) => FakeAnswer | undefined;

/** The repository every default answer is about. */
export const FAKE_REPO = { owner: 'o', name: 'r' } as const;

/** The head of the one open pull request. */
export const FAKE_HEAD_SHA = 'a'.repeat(40);

/** The tip of `main`. */
export const FAKE_BASE_TIP = 'f'.repeat(40);

const REPO_PREFIX = `/repos/${FAKE_REPO.owner}/${FAKE_REPO.name}` as const;

/**
 * What the check verdicts are read from, as {@link checkRoutesAsked} matches a
 * path: the rules on the base, its classic protection, the comparison, the
 * check runs, the commit statuses and the workflow runs.
 */
export const FAKE_CHECK_ROUTES = [
  `${REPO_PREFIX}/rules/branches/`,
  `${REPO_PREFIX}/branches/`,
  `${REPO_PREFIX}/compare/`,
  '/check-runs',
  '/status',
  `${REPO_PREFIX}/actions/runs`,
] as const;

const FAKE_REQUIRED_CONTEXT = 'code-check-result / result';

/** Each route below `/repos/{owner}/{repo}`, and its answer. */
const DEFAULT_ROUTES: readonly (readonly [RegExp, FakeAnswer])[] = [
  [/^\/rules\/branches\/[^/]+$/u, { body: [] }],
  [/^\/branches\/[^/]+$/u, { body: {} }],
  [/^\/git\/ref\/heads\/.+$/u, { body: { object: { sha: FAKE_BASE_TIP } } }],
  [/^\/issues$/u, { body: [] }],
  [/^\/issues\/\d+\/comments$/u, { body: [] }],
  [/^\/compare\/[^/]+$/u, { body: { ahead_by: 0, behind_by: 0, commits: [] } }],
  [
    /^\/commits\/[^/]+\/check-runs$/u,
    { body: { total_count: 0, check_runs: [] } },
  ],
  [/^\/commits\/[^/]+\/status$/u, { body: { statuses: [] } }],
  [/^\/actions\/runs$/u, { body: { total_count: 0, workflow_runs: [] } }],
] as const;

/**
 * The default answer for `url`, by the route the readers ask; 404 for one they
 * do not.
 */
const defaultAnswer = (url: string): FakeAnswer => {
  const { pathname, searchParams } = new URL(url, 'http://localhost');

  // The open list and the closed one, told apart by the query alone.
  if (pathname === `${REPO_PREFIX}/pulls`) {
    return {
      body: searchParams.get('state') === 'open' ? [fakePullRequest()] : [],
    };
  }

  if (pathname === '/graphql') {
    return {
      body: {
        data: {
          repository: {
            pullRequests: {
              pageInfo: { hasNextPage: false, endCursor: null },
              nodes: [],
            },
          },
        },
      },
    };
  }

  if (pathname === '/user') {
    return { body: { login: 'me' } };
  }

  if (pathname === REPO_PREFIX) {
    return { body: { default_branch: 'main' } };
  }

  const route = pathname.startsWith(`${REPO_PREFIX}/`)
    ? pathname.slice(REPO_PREFIX.length)
    : undefined;

  const answer = DEFAULT_ROUTES.find(
    ([pattern]) => route !== undefined && pattern.test(route),
  );

  return answer?.[1] ?? { status: 404, body: { message: 'Not Found' } };
};
