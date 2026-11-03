import { UNREAD_SURVEYS_BEFORE_SETTING_ASIDE } from './constants.mjs';
import type { PullRequest } from './types.mjs';
import {
  advanceUnread,
  holdBack,
  readFailedSkip,
  type Unread,
  type UnreadRead,
  type UnreadStreaks,
} from './unread.mjs';

describe(advanceUnread, () => {
  test('keeps waiting on a pull request unread fewer times than the limit', () => {
    const result = after(UNREAD_SURVEYS_BEFORE_SETTING_ASIDE - 1, [unread(7)]);

    assert.deepStrictEqual(
      result.waiting.map(({ pr }) => pr.number),
      [7],
    );

    assert.deepStrictEqual(result.setAside, []);

    assert.strictEqual(
      result.streaks.get(7)?.surveys,
      UNREAD_SURVEYS_BEFORE_SETTING_ASIDE - 1,
    );
  });

  test('sets it aside on the survey that reaches the limit, with what failed', () => {
    const result = after(UNREAD_SURVEYS_BEFORE_SETTING_ASIDE, [unread(7)]);

    assert.deepStrictEqual(result.waiting, []);

    assert.deepStrictEqual(
      result.setAside.map(({ pr, detail, surveys }) => [
        pr.number,
        detail,
        surveys,
      ]),
      [
        [
          7,
          '#7: could not read checks: boom',
          UNREAD_SURVEYS_BEFORE_SETTING_ASIDE,
        ],
      ],
    );

    // Set aside, it is the skip record's to remember now.
    assert.isFalse(result.streaks.has(7));
  });

  test('starts again when a survey reads it', () => {
    const almost = after(UNREAD_SURVEYS_BEFORE_SETTING_ASIDE - 1, [unread(7)]);

    const read = advanceUnread(almost.streaks, []);

    assert.isFalse(read.streaks.has(7));

    assert.strictEqual(
      advanceUnread(read.streaks, [unread(7)]).streaks.get(7)?.surveys,
      1,
    );
  });

  test('starts again when its head moves', () => {
    const almost = after(UNREAD_SURVEYS_BEFORE_SETTING_ASIDE - 1, [unread(7)]);

    const moved = advanceUnread(almost.streaks, [unread(7, 'b'.repeat(40))]);

    assert.deepStrictEqual(
      moved.waiting.map(({ pr }) => pr.number),
      [7],
    );

    assert.strictEqual(moved.streaks.get(7)?.surveys, 1);
  });

  test('counts each pull request on its own', () => {
    const first = after(UNREAD_SURVEYS_BEFORE_SETTING_ASIDE - 1, [unread(7)]);

    const both = advanceUnread(first.streaks, [unread(7), unread(8)]);

    assert.deepStrictEqual(
      both.setAside.map(({ pr }) => pr.number),
      [7],
    );

    assert.deepStrictEqual(
      both.waiting.map(({ pr }) => pr.number),
      [8],
    );
  });
});

describe(holdBack, () => {
  test('keeps waiting on those set aside whose read GitHub cannot answer anywhere', () => {
    const reached = after(UNREAD_SURVEYS_BEFORE_SETTING_ASIDE, [
      unread(7),
      unread(8, 'b'.repeat(40), 'rebuiltOnTip'),
    ]);

    const held = holdBack(reached, new Set<UnreadRead>(['checks']));

    assert.deepStrictEqual(
      held.setAside.map(({ pr }) => pr.number),
      [8],
    );

    assert.deepStrictEqual(
      held.waiting.map(({ pr }) => pr.number),
      [7],
    );

    // Still at the limit, so the next survey that finds it unread asks again
    // rather than counting from one.
    assert.strictEqual(
      held.streaks.get(7)?.surveys,
      UNREAD_SURVEYS_BEFORE_SETTING_ASIDE,
    );

    assert.strictEqual(
      advanceUnread(held.streaks, [unread(7)]).setAside.length,
      1,
    );
  });

  test('changes nothing when every probe answered', () => {
    const reached = after(UNREAD_SURVEYS_BEFORE_SETTING_ASIDE, [unread(7)]);

    assert.deepStrictEqual(holdBack(reached, new Set<UnreadRead>()), reached);
  });
});

describe(readFailedSkip, () => {
  test('records read-failed at the head and base, saying what failed once', () => {
    assert.deepStrictEqual(
      readFailedSkip({ ...unread(7), surveys: 5 }, 'b'.repeat(40)),
      {
        number: 7,
        headSha: 'a'.repeat(40),
        baseSha: 'b'.repeat(40),
        reason: 'read-failed',
        detail:
          'unread for 5 surveys in a row; the last read said: could not read checks: boom',
      },
    );
  });
});

const none: UnreadStreaks = new Map<
  number,
  Readonly<{ headSha: string; surveys: number }>
>();

const pullRequest = (
  fields: Partial<PullRequest> & Readonly<{ number: number }>,
): PullRequest =>
  ({
    id: `PR_${fields.number}`,
    title: `pull request #${fields.number}`,
    body: '',
    state: 'OPEN',
    headRefName: `feature/${fields.number}`,
    headRefOid: 'a'.repeat(40),
    baseRefName: 'main',
    isCrossRepository: false,
    isDraft: false,
    mergeStateStatus: 'CLEAN',
    autoMergeRequest: {},
    labels: [],
    ...fields,
  }) as const;

const unread = (
  number: number,
  headRefOid = 'a'.repeat(40),
  read: Unread['read'] = 'checks',
): Unread =>
  ({
    pr: pullRequest({ number, headRefOid }),
    read,
    detail: `#${number}: could not read checks: boom`,
  }) as const;

/** `advanceUnread` applied `times` times to the same unread list. */
const after = (
  times: number,
  list: readonly Unread[],
  from: UnreadStreaks = none,
): ReturnType<typeof advanceUnread> => {
  const result = advanceUnread(from, list);

  return times <= 1 ? result : after(times - 1, list, result.streaks);
};
