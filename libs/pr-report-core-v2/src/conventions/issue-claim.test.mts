import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  issueClaimHolds,
  issueClaimLapsesAt,
  parseIssueClaimComment,
  PLANNED_ISSUE_CLAIM_LIFETIME_MS,
  writeIssueClaimComment,
  writeReleasedIssueClaimComment,
  type IssueClaim,
} from './issue-claim.mjs';
import { findRecord } from './records.mjs';

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

describe(issueClaimHolds, () => {
  test('a start holds until it is released, however old', () => {
    assert.isTrue(issueClaimHolds(STARTED, AT + 90 * 24 * HOUR));
  });

  test('a plan lapses after its lifetime', () => {
    assert.isTrue(
      issueClaimHolds(PLANNED, AT + PLANNED_ISSUE_CLAIM_LIFETIME_MS - 1),
    );

    assert.isFalse(
      issueClaimHolds(PLANNED, AT + PLANNED_ISSUE_CLAIM_LIFETIME_MS),
    );
  });

  test('neither counts when dated well ahead of the clock', () => {
    assert.isTrue(issueClaimHolds(STARTED, AT - 5 * MINUTE));

    assert.isFalse(issueClaimHolds(STARTED, AT - 6 * MINUTE));

    assert.isFalse(issueClaimHolds(PLANNED, AT - 6 * MINUTE));
  });

  test('neither holds from a time that does not exist', () => {
    const at = '2026-13-40T00:00:00Z';

    assert.isFalse(issueClaimHolds({ ...STARTED, at }, AT));

    assert.isFalse(issueClaimHolds({ ...PLANNED, at }, AT));
  });
});

describe(issueClaimLapsesAt, () => {
  test('a planned claim lapses after its lifetime, a started one never', () => {
    assert.deepStrictEqual(
      [issueClaimLapsesAt('started', AT), issueClaimLapsesAt('planned', AT)],
      [undefined, AT + PLANNED_ISSUE_CLAIM_LIFETIME_MS],
    );
  });
});

describe(findRecord, () => {
  test('is the oldest claim comment, whatever else is around it', () => {
    assert.deepStrictEqual(
      findRecord(
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
        parseIssueClaimComment,
      ),
      { commentId: 2, says: { kind: 'standing', claim: STARTED } },
    );
  });

  test('finds a released claim as it finds a standing one', () => {
    assert.deepStrictEqual(
      findRecord(
        [{ id: 4, body: writeReleasedIssueClaimComment('Dropped.') }],
        parseIssueClaimComment,
      ),
      { commentId: 4, says: { kind: 'released' } },
    );
  });

  test('is undefined with no claim comment', () => {
    assert.isUndefined(
      findRecord([{ id: 1, body: 'LGTM' }], parseIssueClaimComment),
    );
  });
});

describe('issue-closed-labels.yml', () => {
  // The workflow rewrites a standing claim as released when its issue closes,
  // in shell, so it spells both first lines out instead of importing them.
  test('finds and writes the claim comments as this module reads them', async () => {
    const workflow = await fs.readFile(
      path.join(
        import.meta.dirname,
        '../../../../.github/workflows/issue-closed-labels.yml',
      ),
      'utf8',
    );

    const released = writeReleasedIssueClaimComment('Released.').split(
      '\n',
      1,
    )[0];

    const standing = writeIssueClaimComment(STARTED, 'Started.')
      .split('\n', 1)[0]
      ?.split(' by=', 1)[0]
      ?.replace(/started$/u, '');

    assert.isDefined(released);

    assert.isDefined(standing);

    assert.include(workflow, `'${released}'`);

    assert.include(workflow, `startswith("${standing}")`);
  });
});
