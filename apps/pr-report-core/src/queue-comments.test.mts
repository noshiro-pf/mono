import { writeClaimComment, writeReleasedClaimComment } from './claim.mjs';
import { readQueueComments } from './queue-comments.mjs';
import { writeResolvedComment, writeSetAsideComment } from './set-aside.mjs';

const HEAD = 'c'.repeat(40);

const BASE = 'a'.repeat(40);

/** `2026-10-12T01:30:00Z`. */
const NOW = 1_791_768_600_000;

const STATE = { headSha: HEAD, baseTip: BASE, nowEpochMs: NOW } as const;

const setAsideBody = (reason: string, baseSha = BASE): string =>
  writeSetAsideComment({ reason, headSha: HEAD, baseSha }, 'prose');

const claimBody = (by: string, headSha = HEAD): string =>
  writeClaimComment({ headSha, by, at: '2026-10-12T01:00:00Z' }, 'prose');

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
        { id: 1, body: writeReleasedClaimComment('given up') },
        { id: 2, body: claimBody('session-b') },
      ],
      STATE,
    );

    assert.include(read.claim, { commentId: 1, applies: false });
  });

  test('does not apply once the set-aside is resolved, or its base has moved', () => {
    assert.strictEqual(
      readQueueComments(
        [{ id: 1, body: writeResolvedComment('pushed') }],
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
