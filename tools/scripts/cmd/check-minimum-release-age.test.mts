import {
  classifyExcludeEntry,
  collectViolations,
  parseMinimumReleaseAgeSettings,
  reasonCoversEntry,
  type MinimumReleaseAgeSettings,
} from './check-minimum-release-age.mjs';

const workspaceFile = [
  'packages:',
  '  - libs/*',
  '',
  'minimumReleaseAge: 10080 # = 7 days',
  '',
  '# A comment above the setting.',
  '#',
  '# waiver: @octokit/',
  '#   The family shares `@octokit/openapi-types` and has to move together.',
  '#',
  '# waiver: @types/',
  '#   Already in the lockfile when the permanent exclusion came off.',
  'minimumReleaseAgeExcludePrune: true',
  '',
  'minimumReleaseAgeExclude:',
  "  - '@octokit/core@7.0.8'",
  '',
  '  # A comment between entries is taken away by the next prune.',
  "  - '@types/node@22.20.2 || 24.13.4 || 26.5.0'",
  '',
  'allowBuilds:',
  '  esbuild: true',
  '',
].join('\n');

const settingsOf = (
  overrides: Partial<MinimumReleaseAgeSettings>,
): MinimumReleaseAgeSettings =>
  ({
    delayMinutes: 10080,
    pruneEnabled: true,
    excludeEntries: [],
    waiverReasons: [],
    misplacedReasonTargets: [],
    ...overrides,
  }) as const;

const messagesOf = (settings: MinimumReleaseAgeSettings): readonly string[] =>
  collectViolations(settings).map(
    ({ subject, message }) => `${subject ?? ''} ${message}`,
  );

describe('parseMinimumReleaseAgeSettings', () => {
  test('reads the delay, the prune flag and every entry', () => {
    const settings = parseMinimumReleaseAgeSettings(workspaceFile);

    assert.deepStrictEqual(settings, {
      delayMinutes: 10080,
      pruneEnabled: true,
      excludeEntries: [
        '@octokit/core@7.0.8',
        '@types/node@22.20.2 || 24.13.4 || 26.5.0',
      ],
      waiverReasons: [
        { target: '@octokit/', hasBody: true },
        { target: '@types/', hasBody: true },
      ],
      misplacedReasonTargets: [],
    });
  });

  test('stops the list at the next top-level key', () => {
    const settings = parseMinimumReleaseAgeSettings(workspaceFile);

    assert.isFalse(settings.excludeEntries.includes('esbuild'));
  });

  test('reports a delay that is not declared at all', () => {
    const settings = parseMinimumReleaseAgeSettings(
      ['minimumReleaseAgeExcludePrune: true', ''].join('\n'),
    );

    assert.deepStrictEqual(settings, {
      delayMinutes: undefined,
      pruneEnabled: true,
      excludeEntries: [],
      waiverReasons: [],
      misplacedReasonTargets: [],
    });
  });

  test('reads pruning as off when it is anything but `true`', () => {
    const settings = parseMinimumReleaseAgeSettings(
      [
        'minimumReleaseAge: 10080',
        'minimumReleaseAgeExcludePrune: false',
        '',
      ].join('\n'),
    );

    assert.isFalse(settings.pruneEnabled);
  });

  test('reads a delay written without a trailing comment', () => {
    const settings = parseMinimumReleaseAgeSettings(
      'minimumReleaseAge: 1440\n',
    );

    assert.deepStrictEqual(settings.delayMinutes, 1440);
  });
});

describe('classifyExcludeEntry', () => {
  test('accepts an entry that names a version', () => {
    assert.deepStrictEqual(
      classifyExcludeEntry('@octokit/core@7.0.8'),
      undefined,
    );

    assert.deepStrictEqual(classifyExcludeEntry('vite@8.2.2'), undefined);
  });

  test('accepts one entry naming several versions', () => {
    assert.deepStrictEqual(
      classifyExcludeEntry('@types/node@22.20.2 || 24.13.4 || 26.5.0'),
      undefined,
    );
  });

  test('rejects a bare name, which exempts every version for good', () => {
    assert.deepStrictEqual(classifyExcludeEntry('vite'), 'bare-name');

    assert.deepStrictEqual(classifyExcludeEntry('@octokit/core'), 'bare-name');
  });

  test('rejects a name whose `@` has no version after it', () => {
    assert.deepStrictEqual(classifyExcludeEntry('vite@'), 'bare-name');
  });

  test('rejects a pattern, which pruning keeps by design', () => {
    assert.deepStrictEqual(classifyExcludeEntry('@octokit/*'), 'pattern');

    assert.deepStrictEqual(classifyExcludeEntry('@types/**'), 'pattern');

    assert.deepStrictEqual(classifyExcludeEntry('strict-ts-lib-*'), 'pattern');
  });

  test('rejects a pattern even when it carries a version', () => {
    assert.deepStrictEqual(classifyExcludeEntry('@octokit/*@7.0.8'), 'pattern');
  });
});

describe('parseMinimumReleaseAgeSettings, on the reasons', () => {
  test('reads only the comment block that pruning cannot reach', () => {
    const settings = parseMinimumReleaseAgeSettings(
      [
        '# waiver: above-the-block',
        '#   Read, because pruning rewrites nothing above this key.',
        'minimumReleaseAgeExcludePrune: true',
        '',
        'minimumReleaseAgeExclude:',
        '  # waiver: inside-the-list',
        '#   Not read: this comment goes with the next prune.',
        "  - 'inside-the-list@1.0.0'",
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(settings.waiverReasons, [
      { target: 'above-the-block', hasBody: true },
    ]);

    assert.deepStrictEqual(settings.misplacedReasonTargets, [
      'inside-the-list',
    ]);
  });

  test('stops the block at the last line that is not a comment', () => {
    const settings = parseMinimumReleaseAgeSettings(
      [
        '# waiver: detached',
        '#   A blank line below puts this outside the block.',
        '',
        '# waiver: attached',
        '#   This one is in it.',
        'minimumReleaseAgeExcludePrune: true',
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(settings.waiverReasons, [
      { target: 'attached', hasBody: true },
    ]);

    assert.deepStrictEqual(settings.misplacedReasonTargets, ['detached']);
  });

  test('reports a heading with nothing written under it', () => {
    const settings = parseMinimumReleaseAgeSettings(
      [
        '# waiver: explained',
        '#   Why this one is let through.',
        '#',
        '# waiver: bare',
        'minimumReleaseAgeExcludePrune: true',
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(settings.waiverReasons, [
      { target: 'explained', hasBody: true },
      { target: 'bare', hasBody: false },
    ]);
  });

  test('takes a blank comment line as the end of a reason', () => {
    const settings = parseMinimumReleaseAgeSettings(
      [
        '# waiver: bare',
        '#',
        '#   Written under a blank line, so it reads as a paragraph of its own.',
        'minimumReleaseAgeExcludePrune: true',
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(settings.waiverReasons, [
      { target: 'bare', hasBody: false },
    ]);
  });
});

describe('reasonCoversEntry', () => {
  test('covers a family by prefix', () => {
    assert.isTrue(reasonCoversEntry('@octokit/', '@octokit/core@7.0.8'));

    assert.isTrue(reasonCoversEntry('@types/', '@types/node@24.13.4'));
  });

  test('covers exactly what an unabbreviated heading names', () => {
    assert.isTrue(reasonCoversEntry('vite@8.2.2', 'vite@8.2.2'));

    assert.isFalse(reasonCoversEntry('vite@8.2.2', 'vite@8.2.3'));
  });

  test('does not cover a package the prefix misses', () => {
    assert.isFalse(reasonCoversEntry('@octokit/', '@types/node@24.13.4'));
  });
});

describe('collectViolations', () => {
  test('passes a list whose every entry has a reason', () => {
    assert.deepStrictEqual(
      collectViolations(
        settingsOf({
          excludeEntries: ['@octokit/core@7.0.8'],
          waiverReasons: [{ target: '@octokit/', hasBody: true }],
        }),
      ),
      [],
    );
  });

  test('reports an entry nothing explains', () => {
    const messages = messagesOf(settingsOf({ excludeEntries: ['vite@8.2.2'] }));

    assert.deepStrictEqual(messages.length, 1);

    assert.isTrue(messages[0]?.includes("'vite@8.2.2'") ?? false);

    assert.isTrue(messages[0]?.includes('nothing explains') ?? false);
  });

  test('reports a reason whose entries have all been pruned', () => {
    const messages = messagesOf(
      settingsOf({ waiverReasons: [{ target: '@octokit/', hasBody: true }] }),
    );

    assert.deepStrictEqual(messages.length, 1);

    assert.isTrue(messages[0]?.includes('answers for no entry') ?? false);
  });

  test('reports a heading with no reason under it', () => {
    const messages = messagesOf(
      settingsOf({
        excludeEntries: ['@octokit/core@7.0.8'],
        waiverReasons: [{ target: '@octokit/', hasBody: false }],
      }),
    );

    assert.deepStrictEqual(messages.length, 1);

    assert.isTrue(messages[0]?.includes('has no reason under it') ?? false);
  });

  test('reports a reason written where pruning will take it', () => {
    const messages = messagesOf(
      settingsOf({
        excludeEntries: ['@octokit/core@7.0.8'],
        waiverReasons: [{ target: '@octokit/', hasBody: true }],
        misplacedReasonTargets: ['@octokit/'],
      }),
    );

    assert.deepStrictEqual(messages.length, 1);

    assert.isTrue(messages[0]?.includes('#1937') ?? false);
  });
});
