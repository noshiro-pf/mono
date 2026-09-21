import { serializePayload, type PrReportPayload } from 'pr-report-payload';
import { Result } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { type ReportSource } from './constants.mjs';
import {
  fetchReport,
  fetchRunLog,
  UNCHANGED,
  type Fetch,
} from './fetch-report.mjs';

/**
 * Read with the name as a value rather than as a literal in brackets, which
 * is what keeps `dot-notation` from rewriting it into a property access the
 * index signature does not allow.
 */
const headerOf = (
  headers: ReadonlyRecord<string, string>,
  header: string,
): string | undefined => headers[header];

const source: ReportSource = { owner: 'noshiro-pf', repo: 'mono' } as const;

const payload: PrReportPayload = {
  version: 1,
  repo: { owner: 'noshiro-pf', name: 'mono' },
  generatedAt: '2026-09-20T17:08:58Z',
  generatedAtEpochMs: 1_758_387_338_000,
  authenticated: true,
  required: ['code-check-result'],
  summary: { open: 0, queued: 0, draft: 0, failing: 0, behind: 0 },
  entries: [],
  roots: [],
  cycles: [],
  merged: [],
  mergedWithinDays: 7,
} as const;

/** The file, as GitHub's contents API answers it under `vnd.github.raw`. */
const file = serializePayload(payload);

/** One canned answer from the GitHub API, in place of the network. */
const answering =
  (
    body: string,
    init?: Readonly<{
      status: number;
      headers?: ReadonlyRecord<string, string>;
    }>,
  ): Fetch =>
  () =>
    Promise.resolve(
      new Response(body, {
        status: init?.status ?? 200,
        headers: { etag: '"abc"', ...init?.headers },
      }),
    );

/**
 * A GitHub that answers `304` to the `ETag` it gave out and `200` to anything
 * else, which is what the polling depends on.
 */
const conditional =
  (body: string, etag: string): Fetch =>
  (_route, init) =>
    Promise.resolve(
      headerOf(init.headers, 'If-None-Match') === etag
        ? new Response(undefined, { status: 304, headers: { etag } })
        : new Response(body, { status: 200, headers: { etag } }),
    );

describe(fetchReport, () => {
  test('reads the payload out of the issue the label names', async () => {
    const { result } = await fetchReport(source, {
      etag: undefined,
      token: undefined,
      fetchImpl: answering(file),
    });

    assert.isTrue(Result.isOk(result));

    assert.isTrue(result.value !== UNCHANGED);

    expect(result.value.payload.generatedAt).toBe(payload.generatedAt);

    // Where a person can go and look at the same file.
    expect(result.value.sourceUrl).toBe(
      'https://github.com/noshiro-pf/mono/blob/data/pr-report/pr-report.json',
    );

    // Kept so the next request can be conditional.
    expect(result.value.etag).toBe('"abc"');
  });

  // The first run of the workflow is what creates the branch, so a 404 is a
  // thing that has not happened yet rather than a fault — and the two files
  // are missing for different reasons, so each says its own.
  test('says the report has not been written when there is no file', async () => {
    const { result } = await fetchReport(source, {
      etag: undefined,
      token: undefined,
      fetchImpl: answering('{"message":"Not Found"}', { status: 404 }),
    });

    assert.isTrue(Result.isErr(result));

    assert.isTrue(result.value.includes('PR Report workflow'));
  });

  test('says nobody has run unblock-prs when there is no log', async () => {
    const { result } = await fetchRunLog(source, {
      etag: undefined,
      token: undefined,
      fetchImpl: answering('{"message":"Not Found"}', { status: 404 }),
    });

    assert.isTrue(Result.isErr(result));

    assert.isTrue(result.value.includes('unblock-prs'));
  });

  test('asks for the file itself rather than an envelope around it', async () => {
    const sent = await headersSentFor(undefined);

    expect(headerOf(sent, 'Accept')).toBe('application/vnd.github.raw');
  });

  test('asks the branch the payload lives on', async () => {
    let mut_route = '';

    await fetchReport(source, {
      etag: undefined,
      token: undefined,
      fetchImpl: (route) => {
        mut_route = route;

        return Promise.resolve(new Response(file, { status: 200 }));
      },
    });

    assert.isTrue(
      mut_route.startsWith(
        'https://api.github.com/repos/noshiro-pf/mono/contents/pr-report.json?',
      ),
    );

    assert.isTrue(mut_route.includes('ref=data%2Fpr-report'));
  });

  // The quota a browser spends belongs to the address rather than to the
  // page, so this is the failure a reader is most likely to meet and the one
  // they can do something about.
  test('tells a spent quota apart from any other refusal', async () => {
    const { result } = await fetchReport(source, {
      etag: undefined,
      token: undefined,
      fetchImpl: answering('{"message":"API rate limit exceeded"}', {
        status: 403,
        headers: { 'x-ratelimit-remaining': '0' },
      }),
    });

    assert.isTrue(Result.isErr(result));

    assert.isTrue(result.value.includes('rate limit'));

    // The way out of it, since this reader has not got one.
    assert.isTrue(result.value.includes('token'));
  });

  test('reports any other refusal by its status', async () => {
    const { result } = await fetchReport(source, {
      etag: undefined,
      token: undefined,
      fetchImpl: answering('{"message":"Server Error"}', { status: 500 }),
    });

    assert.isTrue(Result.isErr(result));

    assert.isTrue(result.value.includes('500'));
  });

  test('answers "unchanged" to the ETag it was given', async () => {
    const github = conditional(file, '"v1"');

    const first = await fetchReport(source, {
      etag: undefined,
      token: undefined,
      fetchImpl: github,
    });

    assert.isTrue(Result.isOk(first.result));

    assert.isTrue(first.result.value !== UNCHANGED);

    expect(first.result.value.etag).toBe('"v1"');

    const second = await fetchReport(source, {
      etag: first.result.value.etag,
      token: undefined,
      fetchImpl: github,
    });

    assert.isTrue(Result.isOk(second.result));

    // Not an error and not a re-read: the caller keeps what it has, which is
    // what costs nothing against an authenticated rate limit.
    expect(second.result.value).toBe(UNCHANGED);
  });

  test('does not leave a network failure as an unhandled rejection', async () => {
    const { result } = await fetchReport(source, {
      etag: undefined,
      token: undefined,
      fetchImpl: () => Promise.reject(new TypeError('Failed to fetch')),
    });

    assert.isTrue(Result.isErr(result));

    assert.isTrue(result.value.includes('Could not reach'));
  });
});

/** The headers that went out on the wire for a token, or the lack of one. */
const headersSentFor = async (
  token: string | undefined,
): Promise<ReadonlyRecord<string, string>> => {
  let mut_sent: ReadonlyRecord<string, string> = {};

  await fetchReport(source, {
    token,
    etag: '"v1"',
    fetchImpl: (_route, init) => {
      mut_sent = init.headers;

      return Promise.resolve(new Response(file, { status: 200 }));
    },
  });

  return mut_sent;
};

describe('the token on the request', () => {
  test('sends it as a bearer token beside the conditional header', async () => {
    const sent = await headersSentFor('github_pat_example');

    expect(headerOf(sent, 'Authorization')).toBe('Bearer github_pat_example');

    expect(headerOf(sent, 'If-None-Match')).toBe('"v1"');
  });

  // Anonymous is the case the page is built for, and an `Authorization:
  // Bearer undefined` would be a 401 for every reader who never opened the
  // panel.
  test('sends no authorization at all without one', async () => {
    const sent = await headersSentFor(undefined);

    expect(headerOf(sent, 'Authorization')).toBeUndefined();
  });

  test('says what to do about a token GitHub will not take', async () => {
    const { result } = await fetchReport(source, {
      etag: undefined,
      token: 'expired',
      fetchImpl: answering('{"message":"Bad credentials"}', { status: 401 }),
    });

    assert.isTrue(Result.isErr(result));

    assert.isTrue(result.value.includes('expired'));
  });

  // With a token the account is what runs out, so the sentence that tells an
  // anonymous reader to go and get one would be nonsense.
  test('does not offer a token to a reader who already has one', async () => {
    const { result } = await fetchReport(source, {
      etag: undefined,
      token: 'valid',
      fetchImpl: answering('{"message":"rate limited"}', {
        status: 403,
        headers: { 'x-ratelimit-remaining': '0' },
      }),
    });

    assert.isTrue(Result.isErr(result));

    assert.isTrue(result.value.includes('rate limit'));

    assert.isFalse(result.value.includes('5,000'));
  });
});

describe('the rate limit beside the answer', () => {
  test('is read from a 200', async () => {
    const { rateLimit } = await fetchReport(source, {
      etag: undefined,
      token: undefined,
      fetchImpl: answering(file, {
        status: 200,
        headers: {
          'x-ratelimit-limit': '60',
          'x-ratelimit-remaining': '57',
          'x-ratelimit-reset': '1758387338',
        },
      }),
    });

    assert.deepStrictEqual(rateLimit, {
      limit: 60,
      remaining: 57,
      resetEpochMs: 1_758_387_338_000,
    });
  });

  // The answer a poll gets most of the time, and the one a reader watching
  // the budget most wants the number from. GitHub exposes the headers on it
  // across origins, which is what this depends on.
  test('is read from a 304 as well', async () => {
    const { result, rateLimit } = await fetchReport(source, {
      etag: '"v1"',
      token: 'valid',
      fetchImpl: () =>
        Promise.resolve(
          new Response(undefined, {
            status: 304,
            headers: {
              'x-ratelimit-limit': '5000',
              'x-ratelimit-remaining': '4827',
              'x-ratelimit-reset': '1758387338',
            },
          }),
        ),
    });

    expect(result.value).toBe(UNCHANGED);

    expect(rateLimit?.remaining).toBe(4827);

    expect(rateLimit?.limit).toBe(5000);
  });

  test('is absent when the answer named none', async () => {
    const { rateLimit } = await fetchReport(source, {
      etag: undefined,
      token: undefined,
      fetchImpl: answering(file),
    });

    expect(rateLimit).toBeUndefined();
  });
});
