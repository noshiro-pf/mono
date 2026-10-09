import { Result } from 'ts-data-forge';
import {
  asMilestoneId,
  createMilestone,
  type Milestone,
} from '../domain/index.mjs';
import { applyMilestoneDraft, milestoneToDraft } from './milestone-draft.mjs';

const timeZone = 'Asia/Tokyo';

const milestone: Milestone = createMilestone({
  id: asMilestoneId('m'),
  title: 'リリース',
  now: 0,
  date: 1_791_514_800_000 /* 2026-10-09T03:00:00Z */,
  requiresManualCheck: true,
});

const now = 50_000;

describe(milestoneToDraft, () => {
  test('writes the fields the way the form shows them', () => {
    assert.deepStrictEqual(milestoneToDraft(milestone, timeZone), {
      title: 'リリース',
      description: '',
      date: '2026-10-09T12:00',
      requiresManualCheck: true,
      checkedAt: undefined,
    });
  });
});

describe(applyMilestoneDraft, () => {
  test('changes nothing but updatedAt for the draft of the milestone itself', () => {
    assert.deepStrictEqual(
      applyMilestoneDraft(
        milestone,
        milestoneToDraft(milestone, timeZone),
        now,
        timeZone,
      ),
      Result.ok({ ...milestone, updatedAt: now }),
    );
  });

  test('reads the fields back, the check included', () => {
    assert.deepStrictEqual(
      applyMilestoneDraft(
        milestone,
        {
          title: ' 公開 ',
          description: 'v1',
          date: '',
          requiresManualCheck: true,
          checkedAt: 40_000,
        },
        now,
        timeZone,
      ),
      Result.ok({
        ...milestone,
        title: '公開',
        description: 'v1',
        date: undefined,
        checkedAt: 40_000,
        updatedAt: now,
      }),
    );
  });

  test('drops the check of a milestone that no longer needs one', () => {
    assert.deepStrictEqual(
      Result.map(
        applyMilestoneDraft(
          milestone,
          {
            ...milestoneToDraft(milestone, timeZone),
            requiresManualCheck: false,
            checkedAt: 40_000,
          },
          now,
          timeZone,
        ),
        ({ requiresManualCheck, checkedAt }) => ({
          requiresManualCheck,
          checkedAt,
        }),
      ),
      Result.ok({ requiresManualCheck: false, checkedAt: undefined }),
    );
  });

  test('refuses a draft that is not a milestone, saying why', () => {
    const draft = milestoneToDraft(milestone, timeZone);

    assert.deepStrictEqual(
      applyMilestoneDraft(milestone, { ...draft, title: '' }, now, timeZone),
      Result.err('タイトルを入力してください。'),
    );

    assert.deepStrictEqual(
      applyMilestoneDraft(
        milestone,
        { ...draft, date: '2026-13-01T00:00' },
        now,
        timeZone,
      ),
      Result.err('日時が正しくありません。'),
    );
  });
});
