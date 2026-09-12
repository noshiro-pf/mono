import { Result } from 'ts-data-forge';
import {
  collectResolvedPackageNames,
  exemptedThirdPartyPackages,
  matchesPattern,
  parseMinimumReleaseAgeSettings,
} from './check-minimum-release-age.mjs';

const workspaceFile = [
  'packages:',
  '  - libs/*',
  '',
  'minimumReleaseAge: 10080 # = 7 days',
  '',
  'minimumReleaseAgeExclude:',
  "  - '@types/**'",
  '',
  '  # A comment between entries keeps the reason next to the entry.',
  '  - ts-type-forge',
  "  - 'strict-ts-lib-*'",
  '',
  'allowBuilds:',
  '  esbuild: true',
  '',
].join('\n');

describe('parseMinimumReleaseAgeSettings', () => {
  test('reads the delay and every pattern of the exclusion list', () => {
    const result = parseMinimumReleaseAgeSettings(workspaceFile);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, {
      delayMinutes: 10080,
      excludePatterns: ['@types/**', 'ts-type-forge', 'strict-ts-lib-*'],
    });
  });

  test('stops the list at the next top-level key', () => {
    const result = parseMinimumReleaseAgeSettings(workspaceFile);

    assert.isTrue(Result.isOk(result));

    assert.isFalse(result.value.excludePatterns.includes('esbuild'));
  });

  test('reports a workspace file that declares no delay at all', () => {
    const result = parseMinimumReleaseAgeSettings(
      [
        'packages:',
        '  - libs/*',
        '',
        'minimumReleaseAgeExclude:',
        "  - '@types/**'",
        '',
      ].join('\n'),
    );

    assert.isTrue(Result.isErr(result));

    assert.isTrue(result.value.includes('minimumReleaseAge'));
  });

  test('reads a delay written without a trailing comment', () => {
    const result = parseMinimumReleaseAgeSettings('minimumReleaseAge: 1440\n');

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, {
      delayMinutes: 1440,
      excludePatterns: [],
    });
  });
});

describe('matchesPattern', () => {
  test('takes a name equal to a pattern with no wildcard', () => {
    assert.isTrue(matchesPattern('ts-type-forge', 'ts-type-forge'));

    assert.isFalse(matchesPattern('ts-type-forge', 'ts-type-forge-extra'));
  });

  test('crosses the scope separator, so `*` and `**` mean the same thing', () => {
    assert.isTrue(matchesPattern('@octokit/*', '@octokit/core'));

    assert.isTrue(matchesPattern('@octokit/**', '@octokit/core'));

    assert.isTrue(matchesPattern('@octokit/*', '@octokit/plugin-retry'));
  });

  test('anchors both ends', () => {
    assert.isFalse(matchesPattern('@octokit/*', 'not-@octokit/core'));

    assert.isFalse(matchesPattern('strict-ts-lib-*', 'strict-ts-lib'));

    assert.isTrue(matchesPattern('strict-ts-lib-*', 'strict-ts-lib-v7.0'));
  });

  test('matches a wildcard in the middle', () => {
    assert.isTrue(matchesPattern('eslint-*-typed', 'eslint-config-typed'));

    assert.isFalse(matchesPattern('eslint-*-typed', 'eslint-config-other'));
  });
});

describe('collectResolvedPackageNames', () => {
  test('takes the name of every package the lockfile resolved, once', () => {
    const names = collectResolvedPackageNames(
      [
        'packages:',
        '',
        "  '@octokit/core@7.0.8':",
        '    resolution: {integrity: sha512-abc}',
        '',
        '  ts-type-forge@6.0.0:',
        '    resolution: {integrity: sha512-def}',
        '',
        'snapshots:',
        '',
        "  '@octokit/core@7.0.8(typescript@6.0.3)':",
        '    dependencies:',
        "      '@octokit/auth-token': 6.0.0",
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(names, ['@octokit/core', 'ts-type-forge']);
  });

  test('leaves out what the registry did not serve', () => {
    const names = collectResolvedPackageNames(
      [
        'packages:',
        '',
        '  strict-ts-lib-v7.0-es2017@file:strict-lib/v7.0/output/lib/libs/es2017:',
        '    resolution: {directory: strict-lib/v7.0/output/lib/libs/es2017}',
        '',
        '  semver@7.8.5:',
        '    resolution: {integrity: sha512-ghi}',
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(names, ['semver']);
  });

  test('leaves the importers alone, where a workspace sibling is a link', () => {
    const names = collectResolvedPackageNames(
      [
        'importers:',
        '',
        '  libs/github-settings-as-code:',
        '    dependencies:',
        '      octokit-safe-types:',
        '        specifier: workspace:^',
        '        version: link:../octokit-safe-types',
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(names, []);
  });
});

describe('exemptedThirdPartyPackages', () => {
  const resolvedPackageNames = [
    '@octokit/core',
    '@octokit/request',
    '@octokit/types',
    '@types/node',
    'ts-type-forge',
    'react',
  ];

  const workspacePackageNames = ['ts-type-forge', 'octokit-safe-types'];

  test('reports a third-party package a scope-wide pattern exempts', () => {
    const offenders = exemptedThirdPartyPackages({
      resolvedPackageNames,
      excludePatterns: ['@types/**', '@octokit/**', 'ts-type-forge'],
      workspacePackageNames,
    });

    assert.deepStrictEqual(offenders, [
      { name: '@octokit/core', pattern: '@octokit/**' },
      { name: '@octokit/request', pattern: '@octokit/**' },
      { name: '@octokit/types', pattern: '@octokit/**' },
    ]);
  });

  test('allows `@types/*` and the packages this repository publishes', () => {
    const offenders = exemptedThirdPartyPackages({
      resolvedPackageNames,
      excludePatterns: ['@types/**', 'ts-type-forge'],
      workspacePackageNames,
    });

    assert.deepStrictEqual(offenders, []);
  });

  test('says nothing about a package no pattern names', () => {
    const offenders = exemptedThirdPartyPackages({
      resolvedPackageNames,
      excludePatterns: [],
      workspacePackageNames,
    });

    assert.deepStrictEqual(offenders, []);
  });
});
