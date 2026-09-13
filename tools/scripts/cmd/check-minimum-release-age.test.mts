import {
  classifyExcludeEntry,
  parseMinimumReleaseAgeSettings,
} from './check-minimum-release-age.mjs';

const workspaceFile = [
  'packages:',
  '  - libs/*',
  '',
  'minimumReleaseAge: 10080 # = 7 days',
  '',
  '# A comment above the setting.',
  'minimumReleaseAgeExcludePrune: true',
  '',
  'minimumReleaseAgeExclude:',
  "  - '@octokit/core@7.0.8'",
  '',
  '  # A comment between entries keeps the reason next to the entry.',
  "  - '@types/node@22.20.2 || 24.13.4 || 26.5.0'",
  '',
  'allowBuilds:',
  '  esbuild: true',
  '',
].join('\n');

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
