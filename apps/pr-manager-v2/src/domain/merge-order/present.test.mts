import {
  checksBadgeText,
  codeOwnerBadgeText,
  setAsideBadgeText,
} from './present.mjs';

describe(checksBadgeText, () => {
  test('counts each state, leaving out the empty ones, and names them on hover', () => {
    assert.deepStrictEqual(
      checksBadgeText({
        kind: 'counts',
        verdict: 'failing',
        failed: ['lint'],
        pending: [],
        skipped: ['e2e'],
        passed: ['build', 'test'],
        noneRequired: false,
      }),
      {
        tone: 'critical',
        glyph: '✗',
        word: 'failing',
        counts: '1✗ 1– 2✓',
        title: [
          'Over the 4 contexts the branch rules require:',
          'failed — lint',
          'skipped — e2e',
          'passed — build, test',
        ].join('\n'),
      },
    );
  });

  test('says when it counts every reported context', () => {
    const text = checksBadgeText({
      kind: 'counts',
      verdict: 'running',
      failed: [],
      pending: ['build'],
      skipped: [],
      passed: [],
      noneRequired: true,
    });

    assert.strictEqual(text.word, 'running');

    assert.strictEqual(
      text.title,
      'Over the 1 context reported, the branch rules requiring none:\npending — build',
    );
  });

  test('says why the checks are unread', () => {
    assert.deepStrictEqual(
      checksBadgeText({ kind: 'unread', reason: 'rate limited' }),
      {
        tone: 'neutral',
        glyph: '?',
        word: 'checks unread',
        counts: '',
        title: 'rate limited',
      },
    );
  });
});

describe(codeOwnerBadgeText, () => {
  test('says a bypass is needed when the author is the only owner', () => {
    const text = codeOwnerBadgeText({
      kind: 'bypass',
      owners: ['@a'],
      paths: ['.github/'],
    });

    assert.strictEqual(text.word, 'needs a ruleset bypass');

    assert.include(text.title, '@a');
  });

  test('says teams cannot be resolved without read:org', () => {
    assert.include(
      codeOwnerBadgeText({ kind: 'unknown', teams: ['@o/t'] }).title,
      'read:org',
    );
  });
});

describe(setAsideBadgeText, () => {
  test('greys a record that no longer applies', () => {
    assert.strictEqual(
      setAsideBadgeText({ reason: 'checks failed', applies: false }).tone,
      'neutral',
    );

    assert.strictEqual(
      setAsideBadgeText({ reason: 'checks failed', applies: true }).tone,
      'serious',
    );
  });
});
