import {
  queueOwner,
  readQueueComments,
  writeClaimComment,
  writeSetAsideComment,
  type QueueComments,
  type ReportEntry,
} from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import { decidePush, parsePushArgs } from './push-fixed-pr.mjs';

const HEAD = 'c'.repeat(40);

const FIX = 'f'.repeat(40);

const NOW = Temporal.Instant.from('2026-10-15T00:30:00Z').epochMilliseconds;

const entry = (fields: Partial<ReportEntry> = {}): ReportEntry =>
  ({
    number: 2267,
    title: 'fix: a thing',
    body: '',
    author: 'someone',
    isDraft: false,
    labels: [{ name: 'merge-queued', color: '', description: '' }],
    autoMerge: false,
    headRef: 'fix/a-thing',
    headSha: HEAD,
    baseRef: 'main',
    fromFork: false,
    url: '',
    updatedAt: '2026-10-15T00:00:00Z',
    headCommittedAt: undefined,
    comparison: undefined,
    reported: new Map(),
    checksRunning: false,
    linkedIssues: [],
    mergeAfter: [],
    stackedOn: undefined,
    blockedBy: [],
    checks: {
      verdict: 'paused',
      passed: [],
      failed: [],
      pending: [],
      skipped: [],
      missing: [],
      notRun: [],
      required: 0,
    },
    ...fields,
  }) as const;

const SET_ASIDE = writeSetAsideComment(
  { reason: 'rebase-failed', headSha: HEAD, baseSha: 'a'.repeat(40) },
  'prose',
);

const claimedBy = (by: string): string =>
  writeClaimComment({ headSha: HEAD, by, at: '2026-10-15T00:00:00Z' }, 'prose');

const read = (...bodies: readonly string[]): QueueComments =>
  readQueueComments(
    bodies.map((body, index) => ({ id: index + 1, body })),
    { headSha: HEAD, baseTip: 'a'.repeat(40), nowEpochMs: NOW },
  );

const decide = (
  entries: readonly ReportEntry[],
  ...bodies: readonly string[]
): ReturnType<typeof decidePush> => {
  const comments = read(...bodies);

  const target = entries.find((e) => e.number === 2267);

  return decidePush({
    number: 2267,
    by: 'me',
    head: FIX,
    entries,
    owner:
      target === undefined
        ? undefined
        : queueOwner({
            number: target.number,
            labels: target.labels.map(({ name }) => name),
            isDraft: target.isDraft,
            fromFork: target.fromFork,
            headRef: target.headRef,
            headSha: target.headSha,
            baseRef: target.baseRef,
            defaultBranch: 'main',
            stackedOn: target.stackedOn,
            inCycle: false,
            setAside: comments.setAside?.says,
            claim: comments.claim?.says,
            nowEpochMs: NOW,
          }),
    comments,
  });
};

describe(decidePush, () => {
  test('pushes a claimed fix leased against the claimed head, putting skip-ci on first', () => {
    assert.deepStrictEqual(decide([entry()], SET_ASIDE, claimedBy('me')), {
      kind: 'push',
      pr: {
        number: 2267,
        state: 'OPEN',
        headRefName: 'fix/a-thing',
        headRefOid: HEAD,
        baseRefName: 'main',
        isCrossRepository: false,
      },
      head: FIX,
      addSkipCi: true,
      layers: [],
    });
  });

  test('carries the layers stacked on it along, lowest first', () => {
    const decided = decide(
      [
        entry({
          labels: Arr.toUnshifted({
            name: 'skip-ci',
            color: '',
            description: '',
          })(entry().labels),
        }),
        entry({
          number: 2290,
          headRef: 'feat/top',
          baseRef: 'feat/middle',
          stackedOn: 2280,
        }),
        entry({
          number: 2280,
          headRef: 'feat/middle',
          baseRef: 'fix/a-thing',
          stackedOn: 2267,
        }),
      ],
      SET_ASIDE,
      claimedBy('me'),
    );

    assert.strictEqual(decided.kind, 'push');

    if (decided.kind !== 'push') {
      return;
    }

    assert.isFalse(decided.addSkipCi);

    assert.deepStrictEqual(
      decided.layers.map(({ number }) => number),
      [2280, 2290],
    );
  });

  test('refuses without a claim of its own', () => {
    assert.strictEqual(decide([entry()], SET_ASIDE).kind, 'refuse');

    assert.strictEqual(
      decide([entry()], SET_ASIDE, claimedBy('other')).kind,
      'refuse',
    );
  });

  test('refuses one that is not a skill’s', () => {
    assert.strictEqual(decide([entry()]).kind, 'refuse');
  });

  test('refuses one that is not open', () => {
    assert.strictEqual(decide([], SET_ASIDE, claimedBy('me')).kind, 'refuse');
  });
});

describe(parsePushArgs, () => {
  test('reads the pull request, the claimant and the commit', () => {
    assert.deepStrictEqual(
      parsePushArgs(['--', '2267', '--by', 'me', '--head', FIX]),
      { number: 2267, by: 'me', head: FIX },
    );
  });

  test('refuses what it cannot act on', () => {
    for (const args of [
      [],
      ['2267', '--by', 'me'],
      ['2267', '--head', FIX],
      ['2267', '--by', 'me', '--head', 'HEAD'],
      ['2267', '--by', 'me', '--head', `${FIX};rm`],
      ['x', '--by', 'me', '--head', FIX],
      ['2267', '2268', '--by', 'me', '--head', FIX],
    ]) {
      assert.isString(parsePushArgs(args));
    }
  });
});
