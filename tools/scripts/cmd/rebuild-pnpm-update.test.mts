import {
  queueOwner,
  readQueueComments,
  writeClaimComment,
  writeSetAsideComment,
  type QueueComments,
  type ReportEntry,
} from 'pr-report-core';
import { decideRebuild, parseRebuildArgs } from './rebuild-pnpm-update.mjs';

const HEAD = 'c'.repeat(40);

const NOW = Temporal.Instant.from('2026-10-15T00:30:00Z').epochMilliseconds;

const entry = (fields: Partial<ReportEntry> = {}): ReportEntry =>
  ({
    number: 2290,
    title: 'chore: update dependencies',
    body: '',
    author: 'bot',
    isDraft: false,
    labels: [{ name: 'merge-queued', color: '', description: '' }],
    autoMerge: true,
    headRef: 'chore/pnpm-update',
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

const setAside = (reason: string): string =>
  writeSetAsideComment(
    { reason, headSha: HEAD, baseSha: 'a'.repeat(40) },
    'prose',
  );

const claimedBy = (by: string): string =>
  writeClaimComment({ headSha: HEAD, by, at: '2026-10-15T00:00:00Z' }, 'prose');

const decide = (
  target: ReportEntry | undefined,
  ...bodies: readonly string[]
): string | undefined => {
  const comments: QueueComments = readQueueComments(
    bodies.map((body, index) => ({ id: index + 1, body })),
    { headSha: HEAD, baseTip: 'a'.repeat(40), nowEpochMs: NOW },
  );

  return decideRebuild({
    entry: target,
    by: 'me',
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

describe(decideRebuild, () => {
  test('rebuilds the dependency update set aside rebase-failed and claimed by the caller', () => {
    assert.isUndefined(
      decide(entry(), setAside('rebase-failed'), claimedBy('me')),
    );
  });

  test('refuses another branch, which a fix is pushed to instead', () => {
    assert.isString(
      decide(
        entry({ headRef: 'fix/a-thing' }),
        setAside('rebase-failed'),
        claimedBy('me'),
      ),
    );
  });

  test('refuses a failing check, which a fix is pushed for instead', () => {
    assert.isString(
      decide(entry(), setAside('checks-failed'), claimedBy('me')),
    );
  });

  test('refuses without a claim of its own, or when it is the worker’s', () => {
    assert.isString(decide(entry(), setAside('rebase-failed')));

    assert.isString(
      decide(entry(), setAside('rebase-failed'), claimedBy('other')),
    );

    assert.isString(decide(entry()));

    assert.isString(decide(undefined));
  });
});

describe(parseRebuildArgs, () => {
  test('reads the pull request and the claimant', () => {
    assert.deepStrictEqual(parseRebuildArgs(['--', '2290', '--by', 'me']), {
      number: 2290,
      by: 'me',
    });
  });

  test('refuses what it cannot act on', () => {
    for (const args of [
      [],
      ['2290'],
      ['--by', 'me'],
      ['2290', '2291', '--by', 'me'],
    ]) {
      assert.isString(parseRebuildArgs(args));
    }
  });
});
