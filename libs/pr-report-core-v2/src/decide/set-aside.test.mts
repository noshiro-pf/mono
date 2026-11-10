import {
  writePullRequestClaimComment,
  writeReleasedPullRequestClaimComment,
  writeResolvedSetAsideComment,
  writeSetAsideComment,
  type SetAsideRecord,
} from '../conventions/index.mjs';
import {
  readQueueComments,
  setAsideApplies,
  setAsideStillApplies,
} from './set-aside.mjs';

const HEAD = 'c'.repeat(40);

const BASE = 'a'.repeat(40);

const SET_ASIDE: SetAsideRecord = {
  reason: 'rebase-failed',
  headSha: HEAD,
  baseSha: BASE,
} as const;

describe(setAsideApplies, () => {
  test('lasts while the head and the base are where they were', () => {
    assert.isTrue(setAsideApplies(SET_ASIDE, HEAD, BASE));

    assert.isFalse(setAsideApplies(SET_ASIDE, 'd'.repeat(40), BASE));

    assert.isFalse(setAsideApplies(SET_ASIDE, HEAD, 'b'.repeat(40)));
  });

  test('outlives a moved base, but not a push, when the checks failed', () => {
    const failed = { ...SET_ASIDE, reason: 'checks-failed' } as const;

    assert.isTrue(setAsideApplies(failed, HEAD, 'b'.repeat(40)));

    assert.isFalse(setAsideApplies(failed, 'd'.repeat(40), BASE));
  });
});

describe(setAsideStillApplies, () => {
  test('lasts while the base is where it was', () => {
    assert.isTrue(
      setAsideStillApplies({ reason: 'rebase-failed', baseSha: BASE }, BASE),
    );

    assert.isFalse(
      setAsideStillApplies(
        { reason: 'rebase-failed', baseSha: BASE },
        'b'.repeat(40),
      ),
    );
  });

  test('outlives a moved base when the checks failed', () => {
    assert.isTrue(
      setAsideStillApplies(
        { reason: 'checks-failed', baseSha: BASE },
        'b'.repeat(40),
      ),
    );
  });

  // Green and waiting for a bypass merge: a rebase would only run the same
  // matrix again, for a merge that does not wait for the base.
  test('outlives a moved base when it waits for a bypass merge', () => {
    assert.isTrue(
      setAsideStillApplies(
        { reason: 'awaiting-bypass', baseSha: BASE },
        'b'.repeat(40),
      ),
    );
  });

  // GitHub never took in the branch's last push, and the base moving does not
  // make it take it in; a comment rewritten on every merge would be noise.
  test('outlives a moved base when the branch is out of sync with GitHub', () => {
    assert.isTrue(
      setAsideStillApplies(
        { reason: 'head-out-of-sync', baseSha: BASE },
        'b'.repeat(40),
      ),
    );
  });

  // The rebase that a moved base brings is a new head, and the push that
  // carries it is what starts the workflows GitHub did not start before.
  test('ends with a moved base when no check run started on the head', () => {
    assert.isFalse(
      setAsideStillApplies(
        { reason: 'checks-not-started', baseSha: BASE },
        'b'.repeat(40),
      ),
    );
  });
});

/** `2026-10-12T01:30:00Z`. */
const NOW = 1_791_768_600_000;

const STATE = { headSha: HEAD, baseTip: BASE, nowEpochMs: NOW } as const;

const setAsideBody = (reason: string, baseSha = BASE): string =>
  writeSetAsideComment({ reason, headSha: HEAD, baseSha }, 'prose');

const claimBody = (by: string, headSha = HEAD): string =>
  writePullRequestClaimComment(
    { headSha, by, at: '2026-10-12T01:00:00Z' },
    'prose',
  );

describe(readQueueComments, () => {
  test('finds neither among comments it did not write', () => {
    assert.deepStrictEqual(
      readQueueComments([{ id: 1, body: 'LGTM' }], STATE),
      { setAside: undefined, claim: undefined },
    );
  });

  test('reads a standing set-aside and a standing claim side by side', () => {
    const read = readQueueComments(
      [
        { id: 1, body: setAsideBody('rebase-failed') },
        { id: 2, body: 'a person' },
        { id: 3, body: claimBody('session-a') },
      ],
      STATE,
    );

    assert.include(read.setAside, { commentId: 1, applies: true });

    assert.include(read.claim, { commentId: 3, applies: true });

    assert.deepStrictEqual(read.claim?.says, {
      kind: 'standing',
      claim: { headSha: HEAD, by: 'session-a', at: '2026-10-12T01:00:00Z' },
    });
  });

  test('takes the oldest of several, whatever they say', () => {
    const read = readQueueComments(
      [
        { id: 1, body: writeReleasedPullRequestClaimComment('given up') },
        { id: 2, body: claimBody('session-b') },
      ],
      STATE,
    );

    assert.include(read.claim, { commentId: 1, applies: false });
  });

  test('does not apply once the set-aside is resolved, or its base has moved', () => {
    assert.strictEqual(
      readQueueComments(
        [{ id: 1, body: writeResolvedSetAsideComment('pushed') }],
        STATE,
      ).setAside?.applies,
      false,
    );

    assert.strictEqual(
      readQueueComments(
        [{ id: 1, body: setAsideBody('rebase-failed', 'b'.repeat(40)) }],
        STATE,
      ).setAside?.applies,
      false,
    );

    assert.strictEqual(
      readQueueComments(
        [{ id: 1, body: setAsideBody('checks-failed', 'b'.repeat(40)) }],
        STATE,
      ).setAside?.applies,
      true,
    );
  });

  test('does not apply once a person has asked for a retry', () => {
    // The next survey tries it again, so it is about to be the script's.
    const ticked = setAsideBody('rebase-failed').replace(
      '- [ ] Retry:',
      '- [x] Retry:',
    );

    assert.strictEqual(
      readQueueComments([{ id: 1, body: ticked }], STATE).setAside?.applies,
      false,
    );
  });

  test('does not apply a claim made at a head the branch has left', () => {
    assert.strictEqual(
      readQueueComments(
        [{ id: 1, body: claimBody('a', 'd'.repeat(40)) }],
        STATE,
      ).claim?.applies,
      false,
    );
  });
});
