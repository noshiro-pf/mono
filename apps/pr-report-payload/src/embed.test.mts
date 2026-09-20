import { Result } from 'ts-data-forge';
import { embedPayload, extractPayload } from './embed.mjs';
import {
  PAYLOAD_VERSION,
  type PayloadEntry,
  type PrReportPayload,
} from './payload.mjs';

const entry = (
  overrides: Partial<PayloadEntry> & Readonly<{ number: number }>,
): PayloadEntry =>
  ({
    title: `pull request ${overrides.number}`,
    author: 'noshiro-pf',
    url: `https://github.com/noshiro-pf/mono/pull/${overrides.number}`,
    isDraft: false,
    labels: [],
    autoMerge: false,
    headRef: `branch-${overrides.number}`,
    baseRef: 'main',
    updatedAt: '2026-09-20T00:00:00Z',
    comparison: { aheadBy: 1, behindBy: 0 },
    linkedIssues: [],
    mergeAfter: [],
    blockedBy: [],
    checks: {
      verdict: 'passed',
      failed: [],
      pending: [],
      missing: [],
      required: 9,
    },
    ...overrides,
  }) as const;

const payload = (
  entries: readonly PayloadEntry[] = [entry({ number: 1901 })],
): PrReportPayload =>
  ({
    version: PAYLOAD_VERSION,
    repo: { owner: 'noshiro-pf', name: 'mono' },
    generatedAt: '2026-09-20T17:08:58Z',
    generatedAtEpochMs: 1_758_387_338_000,
    authenticated: true,
    required: ['code-check-result', 'no-skip-ci-label'],
    summary: {
      open: entries.length,
      queued: 0,
      draft: 0,
      failing: 0,
      behind: 0,
    },
    entries,
    roots: entries.map(({ number }) => ({
      number,
      repeated: false,
      children: [],
    })),
    cycles: [],
  }) as const;

describe('embedPayload and extractPayload', () => {
  test('reads back what it wrote', () => {
    const original = payload();

    const read = extractPayload(
      ['# Open pull requests', '', embedPayload(original)].join('\n'),
    );

    assert.isTrue(Result.isOk(read));

    assert.deepStrictEqual(read.value, original);
  });

  test('is not confused by a pull request title holding the end marker', () => {
    const original = payload([
      entry({
        number: 1901,
        title: 'docs: explain <!-- pr-report:payload:end --> in a title',
      }),
    ]);

    const read = extractPayload(embedPayload(original));

    assert.isTrue(Result.isOk(read));

    expect(read.value.entries[0]?.title).toBe(original.entries[0]?.title);
  });

  test('is not confused by a pull request body quoted into the report', () => {
    // The fence the payload sits in can only be closed at the start of a
    // line, and `JSON.stringify` writes no newline at all.
    const original = payload([
      entry({ number: 1901, title: 'fix: ``` and ``` again' }),
    ]);

    const read = extractPayload(embedPayload(original));

    assert.isTrue(Result.isOk(read));

    expect(read.value.entries[0]?.title).toBe(original.entries[0]?.title);
  });

  test('says the report is too old when there is no block at all', () => {
    const read = extractPayload(
      '# Open pull requests\n\nNo open pull requests.\n',
    );

    assert.isTrue(Result.isErr(read));

    assert.isTrue(read.value.includes('no machine-readable payload'));
  });

  test('names both versions when they differ', () => {
    const read = extractPayload(
      embedPayload({ ...payload(), version: PAYLOAD_VERSION + 1 }),
    );

    assert.isTrue(Result.isErr(read));

    assert.isTrue(read.value.includes(`version ${PAYLOAD_VERSION + 1}`));
  });

  test('reports a field of the wrong shape rather than dropping it', () => {
    const read = extractPayload(
      withJsonLine('{"version":1,"repo":{"owner":"noshiro-pf","name":"mono"}}'),
    );

    assert.isTrue(Result.isErr(read));

    assert.isTrue(read.value.includes('not the shape this app reads'));
  });

  test('says a hand-edited body is not JSON rather than failing silently', () => {
    const read = extractPayload(withJsonLine('{ nonsense }'));

    assert.isTrue(Result.isErr(read));

    assert.isTrue(read.value.includes('not JSON'));
  });
});

/**
 * A block with its one line of JSON replaced, which is how a payload the
 * schema has to reject is written without a cast: the markers and the fence
 * stay exactly as `embedPayload` lays them out.
 */
const withJsonLine = (json: string): string =>
  embedPayload(payload())
    .split('\n')
    .map((line) => (line.startsWith('{') ? json : line))
    .join('\n');
