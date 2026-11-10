import {
  parsePullRequestClaimComment,
  PULL_REQUEST_CLAIM_LIFETIME_MS,
  pullRequestClaimHolds,
  writePullRequestClaimComment,
  writeReleasedPullRequestClaimComment,
  type PullRequestClaim,
} from './pull-request-claim.mjs';
import { isClaimant } from './records.mjs';

const HEAD = 'c'.repeat(40);

const CLAIM: PullRequestClaim = {
  headSha: HEAD,
  by: 'https://claude.ai/code/session_01abc',
  at: '2026-10-12T01:00:00Z',
} as const;

/** `CLAIM.at`. */
const AT = 1_791_766_800_000;

const MINUTE = 60_000;

describe(writePullRequestClaimComment, () => {
  test('says who claimed which head and when, in a form it can read back', () => {
    assert.deepStrictEqual(
      parsePullRequestClaimComment(
        writePullRequestClaimComment(CLAIM, 'A session is fixing it.'),
      ),
      { kind: 'standing', claim: CLAIM },
    );
  });

  test('keeps the record out of the prose', () => {
    const lines = writePullRequestClaimComment(
      CLAIM,
      'A session is fixing it.',
    ).split('\n');

    assert.match(lines[0] ?? '', /^<!--.*-->$/u);

    assert.strictEqual(lines[2], 'A session is fixing it.');
  });
});

describe(parsePullRequestClaimComment, () => {
  test('reads a released claim', () => {
    assert.deepStrictEqual(
      parsePullRequestClaimComment(
        writeReleasedPullRequestClaimComment('Given up.'),
      ),
      { kind: 'released' },
    );
  });

  test('is not a set-aside comment, and a set-aside comment is not a claim', () => {
    assert.isUndefined(
      parsePullRequestClaimComment(
        `<!-- unblock-prs:set-aside reason=rebase-failed head=${HEAD} base=${'a'.repeat(40)} -->`,
      ),
    );
  });

  test('reads nothing from a comment it did not write', () => {
    assert.isUndefined(parsePullRequestClaimComment('LGTM'));

    assert.isUndefined(parsePullRequestClaimComment(''));
  });

  test('reads nothing from a record with a short head or a local time', () => {
    assert.isUndefined(
      parsePullRequestClaimComment(
        `<!-- unblock-prs:claim head=${'c'.repeat(10)} by=x at=${CLAIM.at} -->`,
      ),
    );

    assert.isUndefined(
      parsePullRequestClaimComment(
        `<!-- unblock-prs:claim head=${HEAD} by=x at=2026-10-12T10:00:00+09:00 -->`,
      ),
    );
  });

  test('reads nothing from a claimant that would end the comment early', () => {
    assert.isUndefined(
      parsePullRequestClaimComment(
        `<!-- unblock-prs:claim head=${HEAD} by=a>b at=${CLAIM.at} -->`,
      ),
    );
  });
});

describe(isClaimant, () => {
  test('takes a session URL or any other word', () => {
    assert.isTrue(isClaimant(CLAIM.by));

    assert.isTrue(isClaimant('laptop-1234'));
  });

  test('refuses what the record line could not carry', () => {
    for (const by of ['', 'a b', 'a>b', 'a\nb']) {
      assert.isFalse(isClaimant(by));
    }
  });
});

describe(pullRequestClaimHolds, () => {
  test('applies at the head it claimed, within its lifetime', () => {
    assert.isTrue(pullRequestClaimHolds(CLAIM, HEAD, AT));

    assert.isTrue(
      pullRequestClaimHolds(
        CLAIM,
        HEAD,
        AT + PULL_REQUEST_CLAIM_LIFETIME_MS - MINUTE,
      ),
    );
  });

  test('ends when the branch is pushed', () => {
    assert.isFalse(pullRequestClaimHolds(CLAIM, 'd'.repeat(40), AT));
  });

  test('ends when its lifetime runs out', () => {
    assert.isFalse(
      pullRequestClaimHolds(CLAIM, HEAD, AT + PULL_REQUEST_CLAIM_LIFETIME_MS),
    );
  });

  test('does not apply from a time well ahead of the reader', () => {
    // A clock running ahead would otherwise extend the claim by however far
    // ahead it ran. A minute or two is the clocks disagreeing.
    assert.isTrue(pullRequestClaimHolds(CLAIM, HEAD, AT - MINUTE));

    assert.isFalse(pullRequestClaimHolds(CLAIM, HEAD, AT - 10 * MINUTE));
  });

  test('does not apply from a time that does not exist', () => {
    assert.isFalse(
      pullRequestClaimHolds({ ...CLAIM, at: '2026-13-40T00:00:00Z' }, HEAD, AT),
    );
  });
});
