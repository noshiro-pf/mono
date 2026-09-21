import {
  extractPayload,
  PrReportPayloadSchema,
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
    // out of is not, because an issue body has 65536 characters to spend.
    expect(payload.entries[0]?.mergeAfter).toStrictEqual([1900]);

    assert.isTrue(!JSON.stringify(payload).includes('Merge-After'));
  });

  test('says nothing is open rather than saying nothing', () => {
    const read = extractPayload(renderMarkdown(report([])));

    assert.isTrue(Result.isOk(read));

    expect(read.value.entries).toStrictEqual([]);
  });
});

describe('renderMarkdown', () => {
  test('carries a payload a reader of the issue can read back', () => {
    const original: PrReport = report([
      facts({ number: 1901 }),
      facts({ number: 1903, body: 'Merge-After: #1901' }),
    ]);

    const read = extractPayload(renderMarkdown(original));

    assert.isTrue(Result.isOk(read));

    const payload: PrReportPayload = read.value;

    expect(payload.entries.map((entry) => entry.number)).toStrictEqual([
      1901, 1903,
    ]);

    expect(payload.roots).toStrictEqual(original.roots);
  });
});
