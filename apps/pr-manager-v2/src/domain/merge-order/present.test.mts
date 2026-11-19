import {
  autoMergeBadgeText,
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
        icon: 'M4.6 4.6L11.4 11.4M11.4 4.6L4.6 11.4',
        word: 'checks failing',
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

    assert.strictEqual(text.word, 'checks running');

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
  test('names the reason, and greys a record that no longer applies', () => {
    const was = setAsideBadgeText({ reason: 'checks-failed', applies: false });

    assert.strictEqual(was.tone, 'neutral');

    assert.strictEqual(was.word, 'was set aside: checks failed');

    const is = setAsideBadgeText({ reason: 'checks-failed', applies: true });

    assert.strictEqual(is.tone, 'critical');

    assert.strictEqual(is.word, 'set aside: checks failed');
  });
});

describe(autoMergeBadgeText, () => {
  test('says both states, neither in a status colour', () => {
    assert.deepStrictEqual(
      [autoMergeBadgeText(true), autoMergeBadgeText(false)].map(
        ({ tone, glyph, word }) => [tone, glyph, word],
      ),
      [
        ['plain', '⇥', 'auto-merge on'],
        ['quiet', '⊘', 'auto-merge off'],
      ],
    );
  });
});
