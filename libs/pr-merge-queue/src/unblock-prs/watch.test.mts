import { Result } from 'ts-data-forge';
import { afterWatch } from './demotions.mjs';
import { endOfGreenWatch } from './watch.mjs';

describe(endOfGreenWatch, () => {
  test('a hold a review clears is left to triage, with nothing recorded', () => {
    const ended = endOfGreenWatch(
      'BLOCKED',
      Result.ok({ kind: 'held', reason: 'no owner has approved it' }),
    );

    assert.deepStrictEqual(ended, {
      outcome: 'review-held',
      detail: 'no owner has approved it',
    });

    // Not demoted: it goes back in its turn once the review changes.
    assert.strictEqual(
      afterWatch(new Map<number, string>(), 7, 'head', ended.outcome).size,
      0,
    );
  });

  test('a hold on a state triage would watch again is not-merging', () => {
    const ended = endOfGreenWatch(
      'CLEAN',
      Result.ok({ kind: 'held', reason: 'no owner has approved it' }),
    );

    assert.strictEqual(ended.outcome, 'not-merging');

    assert.include(ended.detail, 'no owner has approved it');
  });

  test('a hold only a bypass clears asks for the bypass', () => {
    assert.deepStrictEqual(
      endOfGreenWatch(
        'BLOCKED',
        Result.ok({ kind: 'bypass', reason: 'only its author owns the files' }),
      ),
      {
        outcome: 'awaiting-bypass',
        detail: 'every required check is green; only its author owns the files',
      },
    );
  });

  test('an answer for another head is a push the poll missed', () => {
    assert.deepStrictEqual(
      endOfGreenWatch(
        'BLOCKED',
        Result.err({ otherHead: true, message: 'GitHub read it at abc' }),
      ),
      { outcome: 'head-moved' },
    );
  });

  test('nothing the review says, or no reading it, is not-merging', () => {
    assert.strictEqual(
      endOfGreenWatch('CLEAN', Result.ok(undefined)).outcome,
      'not-merging',
    );

    const unread = endOfGreenWatch(
      'BLOCKED',
      Result.err({ otherHead: false, message: 'HTTP 502' }),
    );

    assert.strictEqual(unread.outcome, 'not-merging');

    assert.include(unread.detail, 'HTTP 502');
  });
});
