import {
  queueOwner,
  readQueueComments,
  writeClaimComment,
  writeReleasedClaimComment,
  writeSetAsideComment,
  type QueueComments,
  type QueueOwner,
} from 'pr-report-core';
import { decideClaim, parseClaimArgs } from './claim-pr.mjs';

const HEAD = 'c'.repeat(40);

const BASE = 'a'.repeat(40);

const NOW = Date.parse('2026-10-12T01:30:00Z');

const SET_ASIDE = writeSetAsideComment(
  { reason: 'rebase-failed', headSha: HEAD, baseSha: BASE },
  'prose',
);

const claimedBy = (by: string): string =>
  writeClaimComment({ headSha: HEAD, by, at: '2026-10-12T01:00:00Z' }, 'prose');

const read = (
  ...bodies: readonly string[]
): ReturnType<typeof readQueueComments> =>
  readQueueComments(
    bodies.map((body, index) => ({ id: index + 1, body })),
    { headSha: HEAD, baseTip: BASE, nowEpochMs: NOW },
  );

/** The owner `claim-pr` reads, from the same comments, for a queued pull request. */
const ownerOf = (queue: QueueComments): QueueOwner | undefined =>
  queueOwner({
    number: 2267,
    labels: ['merge-queued', 'skip-ci'],
    isDraft: false,
    fromFork: false,
    headRef: 'fix/a-thing',
    headSha: HEAD,
    baseRef: 'main',
    defaultBranch: 'main',
    stackedOn: undefined,
    inCycle: false,
    setAside: queue.setAside?.says,
    claim: queue.claim?.says,
    nowEpochMs: NOW,
  });

const decide = (
  by: string,
  ...bodies: readonly string[]
): ReturnType<typeof decideClaim> => {
  const queue = read(...bodies);

  return decideClaim(ownerOf(queue), queue, by);
};

describe(decideClaim, () => {
  test('claims a set-aside pull request nobody holds, as a new comment', () => {
    assert.deepStrictEqual(decide('me', SET_ASIDE), {
      kind: 'write',
      commentId: undefined,
    });
  });

  test('writes over a claim that has ended', () => {
    assert.deepStrictEqual(
      decide('me', SET_ASIDE, writeReleasedClaimComment('gone')),
      { kind: 'write', commentId: 2 },
    );
  });

  test('renews its own claim in place', () => {
    assert.deepStrictEqual(decide('me', SET_ASIDE, claimedBy('me')), {
      kind: 'write',
      commentId: 2,
    });
  });

  test('refuses one someone else holds', () => {
    const decided = decide('me', SET_ASIDE, claimedBy('other'));

    assert.strictEqual(decided.kind, 'refuse');
  });

  test('claims one set aside at its head after the base moved', () => {
    // #2267: the set-aside comment is the hand-off, whatever the tip of the
    // default branch is read as. Until the worker rewrites it as resolved it
    // is the skill's.
    assert.deepStrictEqual(
      decide(
        'me',
        writeSetAsideComment(
          { reason: 'rebase-failed', headSha: HEAD, baseSha: 'b'.repeat(40) },
          'prose',
        ),
      ),
      { kind: 'write', commentId: undefined },
    );
  });

  test('refuses one that is the worker’s or a person’s', () => {
    // Nothing set aside, or set aside at a head that has moved: the worker
    // is about to act on it, or already did.
    assert.strictEqual(decide('me').kind, 'refuse');

    assert.strictEqual(
      decide(
        'me',
        writeSetAsideComment(
          { reason: 'rebase-failed', headSha: 'd'.repeat(40), baseSha: BASE },
          'prose',
        ),
      ).kind,
      'refuse',
    );

    // Only a bypass merge clears it, which no session makes.
    assert.strictEqual(
      decide(
        'me',
        writeSetAsideComment(
          { reason: 'awaiting-bypass', headSha: HEAD, baseSha: BASE },
          'prose',
        ),
      ).kind,
      'refuse',
    );
  });

  test('refuses one whose owner could not be read', () => {
    assert.strictEqual(
      decideClaim(undefined, read(SET_ASIDE), 'me').kind,
      'refuse',
    );
  });
});

describe(parseClaimArgs, () => {
  test('reads a claim and a release', () => {
    assert.deepStrictEqual(parseClaimArgs(['2154', '--by', 'me']), {
      number: 2154,
      by: 'me',
      release: false,
    });

    // `pnpm run claim-pr -- …` passes the `--` on.
    assert.deepStrictEqual(parseClaimArgs(['--', '2154', '--by', 'me']), {
      number: 2154,
      by: 'me',
      release: false,
    });

    assert.deepStrictEqual(
      parseClaimArgs(['--release', '--by', 'me', '#2154']),
      { number: 2154, by: 'me', release: true },
    );
  });

  test('refuses what it cannot act on', () => {
    for (const args of [
      [],
      ['2154'],
      ['--by', 'me'],
      ['x', '--by', 'me'],
      ['2154', '--by', 'a b'],
      ['2154', '--by'],
      ['2154', '--by', 'me', '--force'],
    ]) {
      assert.isString(parseClaimArgs(args));
    }
  });
});
