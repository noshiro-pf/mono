import { embedPayload, type PrReportPayload } from 'pr-report-payload';
import { Result } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { type ReportSource } from './constants.mjs';
import { fetchReport, UNCHANGED, type Fetch } from './fetch-report.mjs';

const source: ReportSource = {
  owner: 'noshiro-pf',
  repo: 'mono',
  label: 'pr-report',
  runLogLabel: 'unblock-prs-log',
} as const;

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
  (_route, sent) =>
    Promise.resolve(
      sent === etag
        ? new Response(undefined, { status: 304 })
        : new Response(body, { status: 200, headers: { etag } }),
    );

describe(fetchReport, () => {
  test('reads the payload out of the issue the label names', async () => {
    const read = await fetchReport(
      source,
      undefined,
      answering(
        JSON.stringify([
          {
            html_url: 'https://github.com/noshiro-pf/mono/issues/1991',
            body: `# Open pull requests\n\n${embedPayload(payload)}`,
          },
        ]),
      ),
    );

    assert.isTrue(Result.isOk(read));

    assert.isTrue(read.value !== UNCHANGED);

    expect(read.value.payload.generatedAt).toBe(payload.generatedAt);

    expect(read.value.issueUrl).toBe(
      'https://github.com/noshiro-pf/mono/issues/1991',
    );

    // Kept so the next request can be conditional.
    expect(read.value.etag).toBe('"abc"');
  });

  test('says where to look when no issue carries the label', async () => {
    const read = await fetchReport(source, undefined, answering('[]'));

    assert.isTrue(Result.isErr(read));

    assert.isTrue(read.value.includes('pr-report'));
  });

  // The quota a browser spends belongs to the address rather than to the
  // page, so this is the failure a reader is most likely to meet and the one
  // they can do something about.
  test('tells a spent quota apart from any other refusal', async () => {
    const read = await fetchReport(
      source,
      undefined,
      answering('{"message":"API rate limit exceeded"}', {
        status: 403,
        headers: { 'x-ratelimit-remaining': '0' },
      }),
    );

    assert.isTrue(Result.isErr(read));

    assert.isTrue(read.value.includes('rate limit'));
  });

  test('reports any other refusal by its status', async () => {
    const read = await fetchReport(
      source,
      undefined,
      answering('{"message":"Not Found"}', { status: 404 }),
    );

    assert.isTrue(Result.isErr(read));

    assert.isTrue(read.value.includes('404'));
  });

  test('answers "unchanged" to the ETag it was given', async () => {
    const issue = JSON.stringify([
      {
        html_url: 'https://github.com/noshiro-pf/mono/issues/1991',
        body: embedPayload(payload),
      },
    ]);

    const github = conditional(issue, '"v1"');

    const first = await fetchReport(source, undefined, github);

    assert.isTrue(Result.isOk(first));

    assert.isTrue(first.value !== UNCHANGED);

    expect(first.value.etag).toBe('"v1"');

    const second = await fetchReport(source, first.value.etag, github);

    assert.isTrue(Result.isOk(second));

    // Not an error and not a re-read: the caller keeps what it has, which is
    // what costs nothing against the rate limit.
    expect(second.value).toBe(UNCHANGED);
  });

  test('does not leave a network failure as an unhandled rejection', async () => {
    const read = await fetchReport(source, undefined, () =>
      Promise.reject(new TypeError('Failed to fetch')),
    );

    assert.isTrue(Result.isErr(read));

    assert.isTrue(read.value.includes('Could not reach'));
  });
});
