import {
  CLAIM_LIFETIME_MINUTES,
  claimApplies,
  isClaimant,
  parseClaimComment,
  writeClaimComment,
  writeReleasedClaimComment,
  type Claim,
} from './claim.mjs';

const HEAD = 'c'.repeat(40);

const CLAIM: Claim = {
  headSha: HEAD,
  by: 'https://claude.ai/code/session_01abc',
  at: '2026-10-12T01:00:00Z',
} as const;

/** `CLAIM.at`. */
const AT = 1_791_766_800_000;

const MINUTE = 60_000;

describe(writeClaimComment, () => {
  test('says who claimed which head and when, in a form it can read back', () => {
    assert.deepStrictEqual(
      parseClaimComment(writeClaimComment(CLAIM, 'A session is fixing it.')),
      { kind: 'standing', claim: CLAIM },
    );
  });

  test('keeps the record out of the prose', () => {
    const lines = writeClaimComment(CLAIM, 'A session is fixing it.').split(
      '\n',
    );

    assert.match(lines[0] ?? '', /^<!--.*-->$/u);

    assert.strictEqual(lines[2], 'A session is fixing it.');
  });
});

describe(parseClaimComment, () => {
  test('reads a released claim', () => {
    assert.deepStrictEqual(
      parseClaimComment(writeReleasedClaimComment('Given up.')),
      { kind: 'released' },
    );
  });

  test('is not a set-aside comment, and a set-aside comment is not a claim', () => {
    assert.isUndefined(
      parseClaimComment(
        `<!-- unblock-prs:set-aside reason=rebase-failed head=${HEAD} base=${'a'.repeat(40)} -->`,
      ),
    );
  });

  test('reads nothing from a comment it did not write', () => {
    assert.isUndefined(parseClaimComment('LGTM'));

    assert.isUndefined(parseClaimComment(''));
  });

  test('reads nothing from a record with a short head or a local time', () => {
    assert.isUndefined(
      parseClaimComment(
        `<!-- unblock-prs:claim head=${'c'.repeat(10)} by=x at=${CLAIM.at} -->`,
      ),
    );

    assert.isUndefined(
      parseClaimComment(
        `<!-- unblock-prs:claim head=${HEAD} by=x at=2026-10-12T10:00:00+09:00 -->`,
      ),
    );
  });

  test('reads nothing from a claimant that would end the comment early', () => {
    assert.isUndefined(
      parseClaimComment(
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

describe(claimApplies, () => {
  test('applies at the head it claimed, within its lifetime', () => {
    assert.isTrue(claimApplies(CLAIM, HEAD, AT));

    assert.isTrue(
      claimApplies(CLAIM, HEAD, AT + (CLAIM_LIFETIME_MINUTES - 1) * MINUTE),
    );
  });

  test('ends when the branch is pushed', () => {
    assert.isFalse(claimApplies(CLAIM, 'd'.repeat(40), AT));
  });

  test('ends when its lifetime runs out', () => {
    assert.isFalse(
      claimApplies(CLAIM, HEAD, AT + CLAIM_LIFETIME_MINUTES * MINUTE),
    );
  });

  test('does not apply from a time well ahead of the reader', () => {
    // A clock running ahead would otherwise extend the claim by however far
    // ahead it ran. A minute or two is the clocks disagreeing.
    assert.isTrue(claimApplies(CLAIM, HEAD, AT - MINUTE));

    assert.isFalse(claimApplies(CLAIM, HEAD, AT - 10 * MINUTE));
  });

  test('does not apply from a time that does not exist', () => {
    assert.isFalse(
      claimApplies({ ...CLAIM, at: '2026-13-40T00:00:00Z' }, HEAD, AT),
    );
  });
});
