import {
  issueClaimApplies,
  parseIssueClaimComment,
  PLANNED_CLAIM_LIFETIME_HOURS,
  readIssueClaim,
  writeIssueClaimComment,
  writeReleasedIssueClaimComment,
  type IssueClaim,
} from './issue-claim.mjs';

const STARTED: IssueClaim = {
  state: 'started',
  by: 'https://claude.ai/code/session_01abc',
  at: '2026-10-12T01:00:00Z',
} as const;

const PLANNED: IssueClaim = { ...STARTED, state: 'planned' } as const;

/** `STARTED.at`. */
const AT = 1_791_766_800_000;

const MINUTE = 60_000;

const HOUR = 60 * MINUTE;

describe(writeIssueClaimComment, () => {
  test('says who claimed it, how and when, in a form it can read back', () => {
    assert.deepStrictEqual(
      parseIssueClaimComment(writeIssueClaimComment(STARTED, 'Started.')),
      { kind: 'standing', claim: STARTED },
    );

    assert.deepStrictEqual(
      parseIssueClaimComment(writeIssueClaimComment(PLANNED, 'Planned.')),
      { kind: 'standing', claim: PLANNED },
    );
  });

  test('keeps the record out of the prose', () => {
    const lines = writeIssueClaimComment(STARTED, 'Started.').split('\n');

    assert.match(lines[0] ?? '', /^<!--.*-->$/u);

    assert.strictEqual(lines[2], 'Started.');
  });
});

describe(parseIssueClaimComment, () => {
  test('reads a released claim', () => {
    assert.deepStrictEqual(
      parseIssueClaimComment(writeReleasedIssueClaimComment('Dropped.')),
      { kind: 'released' },
    );
  });

  test('is not a pull request claim, and a pull request claim is not one', () => {
    assert.isUndefined(
      parseIssueClaimComment(
        `<!-- unblock-prs:claim head=${'c'.repeat(40)} by=x at=2026-10-12T01:00:00Z -->`,
      ),
    );
  });

  test('reads nothing from a comment it did not write', () => {
    assert.isUndefined(parseIssueClaimComment('I will take this one.'));

    assert.isUndefined(
      parseIssueClaimComment(
        '<!-- start-issue:claim state=done by=x at=2026-10-12T01:00:00Z -->',
      ),
    );
  });
});

describe(issueClaimApplies, () => {
  test('a start holds until it is released, however old', () => {
    assert.isTrue(issueClaimApplies(STARTED, AT + 90 * 24 * HOUR));
  });

  test('a plan lapses after its lifetime', () => {
    assert.isTrue(
      issueClaimApplies(PLANNED, AT + PLANNED_CLAIM_LIFETIME_HOURS * HOUR - 1),
    );

    assert.isFalse(
      issueClaimApplies(PLANNED, AT + PLANNED_CLAIM_LIFETIME_HOURS * HOUR),
    );
  });

  test('neither counts when dated well ahead of the clock', () => {
    assert.isTrue(issueClaimApplies(STARTED, AT - 5 * MINUTE));

    assert.isFalse(issueClaimApplies(STARTED, AT - 6 * MINUTE));

    assert.isFalse(issueClaimApplies(PLANNED, AT - 6 * MINUTE));
  });
});

describe(readIssueClaim, () => {
  test('is the oldest claim comment, whatever else is around it', () => {
    assert.deepStrictEqual(
      readIssueClaim(
        [
          { id: 1, body: 'LGTM' },
          { id: 2, body: writeIssueClaimComment(STARTED, 'Started.') },
          {
            id: 3,
            body: writeIssueClaimComment(
              { ...STARTED, by: 'another-session' },
              'Started.',
            ),
          },
        ],
        AT,
      ),
      {
        commentId: 2,
        says: { kind: 'standing', claim: STARTED },
        applies: true,
      },
    );
  });

  test('says when a claim no longer holds', () => {
    assert.deepStrictEqual(
      readIssueClaim(
        [{ id: 4, body: writeReleasedIssueClaimComment('Dropped.') }],
        AT,
      ),
      { commentId: 4, says: { kind: 'released' }, applies: false },
    );

    assert.deepStrictEqual(
      readIssueClaim(
        [{ id: 5, body: writeIssueClaimComment(PLANNED, 'Planned.') }],
        AT + PLANNED_CLAIM_LIFETIME_HOURS * HOUR,
      ),
      {
        commentId: 5,
        says: { kind: 'standing', claim: PLANNED },
        applies: false,
      },
    );
  });

  test('is undefined with no claim comment', () => {
    assert.isUndefined(readIssueClaim([{ id: 1, body: 'LGTM' }], AT));
  });
});
