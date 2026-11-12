import { Result } from 'ts-data-forge';
import {
  writePullRequestClaimComment,
  writeReleasedPullRequestClaimComment,
  writeSetAsideComment,
} from '../conventions/index.mjs';
import {
  decidePullRequestClaim,
  decideReleasePullRequestClaim,
  heldPullRequestClaim,
  recheckPullRequestClaim,
} from './claim-pr.mjs';
import { queueOwner, type QueueOwner } from './owner.mjs';
import { readQueueComments, type QueueComments } from './set-aside.mjs';

const HEAD = 'c'.repeat(40);

const UNREAD = {
  kind: 'unavailable',
  what: 'the comments of #1',
  message: 'timed out',
} as const;

const BASE = 'a'.repeat(40);

const NOW = Date.parse('2026-10-12T01:30:00Z');

const SET_ASIDE = writeSetAsideComment(
  { reason: 'rebase-failed', headSha: HEAD, baseSha: BASE },
  'prose',
);

const claimedBy = (by: string, at = '2026-10-12T01:00:00Z'): string =>
  writePullRequestClaimComment({ headSha: HEAD, by, at }, 'prose');

const read = (...bodies: readonly string[]): QueueComments =>
  readQueueComments(
    bodies.map((body, index) => ({ id: index + 1, body })),
    { headSha: HEAD, baseTip: BASE, nowEpochMs: NOW },
  );

/** The owner `claim-pr` reads, from the same comments, for a queued pull request. */
const ownerOf = (comments: QueueComments): QueueOwner | undefined =>
  queueOwner({
    labels: ['merge-queued', 'skip-ci'],
    isDraft: false,
    fromFork: false,
    headRef: 'fix/a-thing',
    headSha: HEAD,
    baseRef: 'main',
    defaultBranch: 'main',
    stackedOn: undefined,
    inCycle: false,
    setAside: comments.setAside?.says,
    claim: comments.claim?.says,
    nowEpochMs: NOW,
  });

/** A claim comment by `by`, id 2, as `readPullRequestClaim` finds it. */
const found = (by: string): QueueComments['claim'] =>
  read(SET_ASIDE, claimedBy(by)).claim;

const decide = (
  by: string,
  ...bodies: readonly string[]
): ReturnType<typeof decidePullRequestClaim> => {
  const comments = read(...bodies);

  return decidePullRequestClaim(
    { owner: Result.ok(ownerOf(comments)), comments: Result.ok(comments) },
    { by, headSha: HEAD },
  );
};

describe(decidePullRequestClaim, () => {
  test('claims a set-aside pull request nobody holds, as a new comment', () => {
    assert.deepStrictEqual(decide('me', SET_ASIDE), {
      kind: 'write',
      setAsideFor: 'rebase-failed',
    });
  });

  test('writes over a claim that has ended', () => {
    assert.deepStrictEqual(
      decide('me', SET_ASIDE, writeReleasedPullRequestClaimComment('gone')),
      { kind: 'write', setAsideFor: 'rebase-failed' },
    );

    // Lapsed: written more than the lifetime ago.
    assert.deepStrictEqual(
      decide('me', SET_ASIDE, claimedBy('other', '2026-10-11T01:00:00Z')),
      { kind: 'write', setAsideFor: 'rebase-failed' },
    );
  });

  test('renews its own claim in place', () => {
    assert.deepStrictEqual(decide('me', SET_ASIDE, claimedBy('me')), {
      kind: 'write',
      setAsideFor: 'rebase-failed',
    });
  });

  test('refuses one someone else holds', () => {
    assert.deepStrictEqual(decide('me', SET_ASIDE, claimedBy('other')), {
      kind: 'refuse',
      reason: 'other claimed it at 2026-10-12T01:00:00Z',
    });
  });

  test('claims one set aside at its head after the base moved', () => {
    // #2267: the set-aside comment is the hand-off, whatever the tip of the
    // default branch is read as. Until the worker rewrites it as resolved it is
    // the skill's.
    assert.strictEqual(
      decide(
        'me',
        writeSetAsideComment(
          { reason: 'rebase-failed', headSha: HEAD, baseSha: 'b'.repeat(40) },
          'prose',
        ),
      ).kind,
      'write',
    );
  });

  test('refuses one that is the worker’s or a person’s', () => {
    // Nothing set aside, or set aside at a head that has moved: the worker is
    // about to act on it, or already did.
    assert.deepStrictEqual(decide('me'), {
      kind: 'refuse',
      reason:
        "it is the worker's (in the queue; the worker picks it in its turn), not a skill's",
    });

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

  test('says whose it is when nobody is', () => {
    assert.deepStrictEqual(
      decidePullRequestClaim(
        {
          owner: Result.ok({ owner: 'none', reason: 'set aside for `x`' }),
          comments: Result.ok(read()),
        },
        { by: 'me', headSha: HEAD },
      ),
      {
        kind: 'refuse',
        reason:
          "it is no one's, which is a bug (set aside for `x`), not a skill's",
      },
    );
  });

  test('names no reason a set-aside comment at another head gave', () => {
    const comments = read(SET_ASIDE);

    assert.deepStrictEqual(
      decidePullRequestClaim(
        {
          owner: Result.ok({ owner: 'skill', reason: 'claimed' }),
          comments: Result.ok(comments),
        },
        { by: 'me', headSha: 'd'.repeat(40) },
      ),
      { kind: 'write', setAsideFor: undefined },
    );
  });

  test('refuses one the queue does not cover, or whose owner is unread', () => {
    assert.deepStrictEqual(
      decidePullRequestClaim(
        { owner: Result.ok(undefined), comments: Result.ok(read(SET_ASIDE)) },
        { by: 'me', headSha: HEAD },
      ),
      { kind: 'refuse', reason: 'it is not in the queue' },
    );

    assert.deepStrictEqual(
      decidePullRequestClaim(
        {
          owner: Result.err(UNREAD),
          comments: Result.err(UNREAD),
        },
        { by: 'me', headSha: HEAD },
      ),
      {
        kind: 'refuse',
        reason: 'who owns it could not be read (the comments of #1: timed out)',
      },
    );
  });
});

describe(recheckPullRequestClaim, () => {
  const ask = { by: 'me', headSha: HEAD, nowEpochMs: NOW } as const;

  test('writes over the claim comment read just now', () => {
    assert.deepStrictEqual(
      recheckPullRequestClaim(
        { open: true, headSha: HEAD, comment: found('me') },
        ask,
      ),
      {
        kind: 'write',
        commentId: 2,
        held: { headSha: HEAD, by: 'me', at: '2026-10-12T01:00:00Z' },
      },
    );

    assert.deepStrictEqual(
      recheckPullRequestClaim(
        { open: true, headSha: HEAD, comment: undefined },
        ask,
      ),
      { kind: 'write', commentId: undefined, held: undefined },
    );
  });

  test('refuses a claim someone wrote since the queue was read', () => {
    assert.deepStrictEqual(
      recheckPullRequestClaim(
        { open: true, headSha: HEAD, comment: found('other') },
        ask,
      ),
      { kind: 'refuse', reason: 'other claimed it at 2026-10-12T01:00:00Z' },
    );
  });

  test('refuses one closed, or pushed to, since', () => {
    assert.deepStrictEqual(
      recheckPullRequestClaim(
        { open: false, headSha: HEAD, comment: undefined },
        ask,
      ),
      { kind: 'refuse', reason: 'it is no longer open' },
    );

    assert.deepStrictEqual(
      recheckPullRequestClaim(
        { open: true, headSha: 'd'.repeat(40), comment: undefined },
        ask,
      ),
      {
        kind: 'refuse',
        reason: `its head moved to ${'d'.repeat(40)} meanwhile`,
      },
    );
  });
});

describe(decideReleasePullRequestClaim, () => {
  test('releases the claimant’s own claim, holding or lapsed', () => {
    assert.deepStrictEqual(
      decideReleasePullRequestClaim(
        read(SET_ASIDE, claimedBy('me')).claim,
        'me',
      ),
      { kind: 'release', commentId: 2 },
    );

    assert.deepStrictEqual(
      decideReleasePullRequestClaim(
        read(claimedBy('me', '2026-10-11T01:00:00Z')).claim,
        'me',
      ),
      { kind: 'release', commentId: 1 },
    );
  });

  test('has nothing to release of someone else’s, a released one, or none', () => {
    for (const comments of [
      read(claimedBy('other')),
      read(writeReleasedPullRequestClaimComment('gone')),
      read(SET_ASIDE),
    ]) {
      assert.deepStrictEqual(
        decideReleasePullRequestClaim(comments.claim, 'me'),
        { kind: 'none' },
      );
    }
  });
});

describe(heldPullRequestClaim, () => {
  const standing = {
    kind: 'standing',
    claim: { headSha: HEAD, by: 'me', at: '2026-10-12T01:00:00Z' },
  } as const;

  test('is the claim while it holds at the head', () => {
    assert.deepStrictEqual(
      heldPullRequestClaim(standing, HEAD, NOW),
      standing.claim,
    );
  });

  test('is none once the head moved, it lapsed, or it was released', () => {
    assert.isUndefined(heldPullRequestClaim(standing, 'd'.repeat(40), NOW));

    assert.isUndefined(
      heldPullRequestClaim(standing, HEAD, NOW + 24 * 60 * 60_000),
    );

    assert.isUndefined(heldPullRequestClaim({ kind: 'released' }, HEAD, NOW));

    assert.isUndefined(heldPullRequestClaim(undefined, HEAD, NOW));
  });
});
