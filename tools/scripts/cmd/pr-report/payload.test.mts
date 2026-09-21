import {
  parsePayload,
  PrReportPayloadSchema,
  serializePayload,
  type PrReportPayload,
} from 'pr-report-payload';
import { Result } from 'ts-data-forge';
import { toPayload } from './payload.mjs';
import { renderMarkdown } from './render.mjs';
import { buildReport } from './report.mjs';
import { type PrReport, type PullRequestFacts } from './types.mjs';

const facts = (
  overrides: Partial<PullRequestFacts> & Readonly<{ number: number }>,
): PullRequestFacts =>
  ({
    title: `pull request ${overrides.number}`,
    body: '',
    author: 'noshiro-pf',
    isDraft: false,
    labels: [],
    headRef: `branch-${overrides.number}`,
    headSha: '0'.repeat(40),
    baseRef: 'main',
    url: `https://github.com/noshiro-pf/mono/pull/${overrides.number}`,
    updatedAt: '2026-09-18T00:00:00Z',
    comparison: { aheadBy: 1, behindBy: 0 },
    autoMerge: false,
    reported: new Map(),
    linkedIssues: [],
    ...overrides,
  }) as const;

const report = (pulls: readonly PullRequestFacts[]): PrReport =>
  buildReport({
    repo: { owner: 'noshiro-pf', name: 'mono' },
    generatedAt: '2026-09-18T09:00:00Z',
    required: ['code-check-result', 'no-skip-ci-label'],
    merged: [],
    mergedWithinDays: 7,
    authenticated: true,
    pulls,
  });

describe('toPayload', () => {
  // This is the check the shared package exists for. The report is built
  // here and the shape is declared there, so a field renamed on one side
  // fails here rather than in a browser nobody is looking at.
  test('writes what the app validates', () => {
    const validated = PrReportPayloadSchema.validate(
      toPayload(report([facts({ number: 1901 })])),
    );

    assert.isTrue(Result.isOk(validated));
  });

  test('leaves the pull request bodies behind', () => {
    const payload = toPayload(
      report([facts({ number: 1901, body: 'Merge-After: #1900' })]),
    );

    // The trailer it was read for is in the payload; the prose it was read
    // out of is not, because nothing displays a body and it is by far the
    // largest thing read about a pull request.
    expect(payload.entries[0]?.mergeAfter).toStrictEqual([1900]);

    assert.isTrue(!JSON.stringify(payload).includes('Merge-After'));
  });

  // "Nothing is open" is an answer the page has to be able to give, and it
  // has to be told rather than left to infer it from a file that is not
  // there.
  test('says nothing is open rather than saying nothing', () => {
    const read = parsePayload(serializePayload(toPayload(report([]))));

    assert.isTrue(Result.isOk(read));

    expect(read.value.entries).toStrictEqual([]);
  });
});

/**
 * The drift this file exists to catch: the writer and the reader are two
 * packages, and the only thing joining them is that what one serializes the
 * other parses.
 */
describe('the file the page reads', () => {
  test('round-trips a report through the branch payload', () => {
    const original: PrReport = report([
      facts({ number: 1901 }),
      facts({ number: 1903, body: 'Merge-After: #1901' }),
    ]);

    const read = parsePayload(serializePayload(toPayload(original)));

    assert.isTrue(Result.isOk(read));

    const payload: PrReportPayload = read.value;

    expect(payload.entries.map((entry) => entry.number)).toStrictEqual([
      1901, 1903,
    ]);

    expect(payload.roots).toStrictEqual(original.roots);
  });
});

describe('renderMarkdown', () => {
  // The payload used to be a collapsed block at the bottom of this. It is a
  // file on a branch now, and the issue is prose again.
  test('carries no machine-readable copy of itself', () => {
    const markdown = renderMarkdown(
      report([facts({ number: 1901 }), facts({ number: 1903 })]),
    );

    assert.isFalse(markdown.includes('pr-report:payload'));

    assert.isFalse(markdown.includes('"generatedAtEpochMs"'));
  });
});
