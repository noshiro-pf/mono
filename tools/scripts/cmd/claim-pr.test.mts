import {
  readQueueComments,
  writeClaimComment,
  writeReleasedClaimComment,
  writeSetAsideComment,
} from 'pr-report-core';
import { decideClaim, parseClaimArgs } from './claim-pr.mjs';

const HEAD = 'c'.repeat(40);

const BASE = 'a'.repeat(40);

const NOW = Temporal.Instant.from('2026-10-12T01:30:00Z').epochMilliseconds;

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

describe(decideClaim, () => {
  test('claims a set-aside pull request nobody holds, as a new comment', () => {
    assert.deepStrictEqual(decideClaim(read(SET_ASIDE), 'me'), {
      kind: 'write',
      commentId: undefined,
    });
  });

  test('writes over a claim that has ended', () => {
    assert.deepStrictEqual(
      decideClaim(read(SET_ASIDE, writeReleasedClaimComment('gone')), 'me'),
      { kind: 'write', commentId: 2 },
    );
  });

  test('renews its own claim in place', () => {
    assert.deepStrictEqual(
      decideClaim(read(SET_ASIDE, claimedBy('me')), 'me'),
      {
        kind: 'write',
        commentId: 2,
      },
    );
  });

  test('refuses one someone else holds', () => {
    const decided = decideClaim(read(SET_ASIDE, claimedBy('other')), 'me');

    assert.strictEqual(decided.kind, 'refuse');
  });

  test('refuses one that is not set aside at its head and base', () => {
    // The script is about to act on it, or already did: nothing to take over.
    assert.strictEqual(decideClaim(read(), 'me').kind, 'refuse');

    assert.strictEqual(
      decideClaim(
        read(
          writeSetAsideComment(
            { reason: 'rebase-failed', headSha: HEAD, baseSha: 'b'.repeat(40) },
            'prose',
          ),
        ),
        'me',
      ).kind,
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
