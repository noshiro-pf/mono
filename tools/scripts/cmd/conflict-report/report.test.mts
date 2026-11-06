import {
  pathGroup,
  readSetAside,
  renderMarkdown,
  summarize,
} from './report.mjs';

const GENERATED = [/^docs\/package-dependencies\.md$/u] as const;

describe(pathGroup, () => {
  test('names a generated file, and a hand-written one by its package', () => {
    assert.strictEqual(
      pathGroup('docs/package-dependencies.md', GENERATED),
      'docs/package-dependencies.md (generated)',
    );

    assert.strictEqual(pathGroup('libs/a/src/x.mts', GENERATED), 'libs/a');

    assert.strictEqual(pathGroup('apps/b/README.md', GENERATED), 'apps/b');

    assert.strictEqual(
      pathGroup('languages/sumi/checker/x.mts', GENERATED),
      'languages/sumi/checker',
    );

    assert.strictEqual(pathGroup('tools/scripts/x.mts', GENERATED), 'tools');

    assert.strictEqual(pathGroup('CLAUDE.md', GENERATED), '(root)');
  });
});

describe(readSetAside, () => {
  test('reads a standing one, with its failed checks', () => {
    assert.deepStrictEqual(
      readSetAside(
        [
          '<!-- unblock-prs:set-aside reason=checks-failed head=abc base=def -->',
          '',
          '**`unblock-prs` set this pull request aside** (`checks-failed`): failed: x',
          '',
          'Failed required checks:',
          '',
          '- [code-check (lint)](https://x/1)',
          '- style-check (fmt)',
          '',
          '- [ ] retry',
        ].join('\n'),
      ),
      {
        reason: 'checks-failed',
        failedChecks: ['code-check (lint)', 'style-check (fmt)'],
      },
    );
  });

  test('reads a resolved one, and what it said under the fold', () => {
    assert.deepStrictEqual(
      readSetAside(
        [
          '<!-- unblock-prs:set-aside resolved -->',
          '',
          'Resolved at 2026-11-05T10:52:31Z: no longer set aside (`checks-failed` at `87d0081300`) — the branch was pushed.',
          '',
          '<details><summary>What it said</summary>',
          '',
          'Failed required checks:',
          '',
          '- [code-check (lint)](https://x/1)',
          '',
          '</details>',
        ].join('\n'),
      ),
      { reason: 'checks-failed', failedChecks: ['code-check (lint)'] },
    );
  });

  test('is undefined for any other comment', () => {
    assert.isUndefined(readSetAside('LGTM'));
  });
});

describe(summarize, () => {
  test('counts conflicts by kind, place and session, and set-asides by reason', () => {
    const report = summarize({
      days: 7,
      merged: [1, 2, 3, 4],
      events: [
        {
          pr: 1,
          paths: ['docs/package-dependencies.md'],
          partners: [9],
          sameSession: false,
        },
        {
          pr: 2,
          paths: ['docs/package-dependencies.md', 'libs/a/src/x.mts'],
          partners: [1],
          sameSession: true,
        },
        {
          pr: 2,
          paths: ['libs/a/src/y.mts'],
          partners: [],
          sameSession: false,
        },
      ],
      setAsides: [
        { pr: 1, reason: 'rebase-failed', failedChecks: [] },
        { pr: 3, reason: 'checks-failed', failedChecks: ['code-check (lint)'] },
        { pr: 4, reason: 'checks-failed', failedChecks: ['code-check (lint)'] },
      ],
      generated: GENERATED,
    });

    assert.deepStrictEqual(report, {
      days: 7,
      merged: 4,
      conflicted: 2,
      events: 3,
      generatedOnly: 1,
      generatedOnlyPullRequests: 1,
      sameSession: 1,
      otherSession: 1,
      unknownSession: 1,
      groups: [
        ['docs/package-dependencies.md (generated)', 2],
        ['libs/a', 2],
      ],
      setAsideReasons: [
        ['checks-failed', 2],
        ['rebase-failed', 1],
      ],
      failedChecks: [['code-check (lint)', 2]],
    });
  });
});

describe(renderMarkdown, () => {
  test('leads with the counts', () => {
    const md = renderMarkdown({
      days: 7,
      merged: 4,
      conflicted: 2,
      events: 3,
      generatedOnly: 1,
      generatedOnlyPullRequests: 0,
      sameSession: 1,
      otherSession: 1,
      unknownSession: 1,
      groups: [['libs/a', 2]],
      setAsideReasons: [['checks-failed', 2]],
      failedChecks: [['code-check (lint)', 2]],
    });

    assert.include(md, '# Conflicts in the last 7 days');

    assert.include(md, '| Pull requests merged | 4 |');

    assert.include(md, '| `libs/a` | 2 |');

    assert.include(md, '| `code-check (lint)` | 2 |');
  });
});
