import { Arr, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  type DependencySpecifierExemption,
  EXACT_VERSION,
  EXEMPTIONS,
  findDependencySpecifierProblems,
  parseCatalogNames,
  parseManifest,
} from './check-dependency-specifiers.mjs';

const member = (
  relativePath: string,
  manifest: ReadonlyRecord<string, unknown>,
): Readonly<{ relativePath: string; manifest: unknown }> =>
  ({
    relativePath,
    manifest,
  }) as const;

const library = member('libs/lib-a/package.json', {
  name: 'lib-a',
  version: '1.0.0',
});

const find = (
  manifests: readonly Readonly<{ relativePath: string; manifest: unknown }>[],
  exemptions: readonly DependencySpecifierExemption[] = [],
): ReturnType<typeof findDependencySpecifierProblems> =>
  findDependencySpecifierProblems({
    manifests: Arr.toUnshifted(library)(manifests),
    catalogNames: new Set<string>(['eslint', 'typescript']),
    exemptions,
  });

// The fixture keeps the production specifier pattern and its wording, so the
// mechanism is tested on what the guard uses; the EXEMPTIONS table below tests
// the real entries.
const harnessTypeScript: DependencySpecifierExemption = {
  manifest: /^strict-lib\/v\d+\.\d+\/package\.json$/u,
  field: 'devDependencies',
  dependency: 'typescript',
  ...EXACT_VERSION,
  reason: 'each harness pins the TypeScript minor it converts',
} as const;

describe(findDependencySpecifierProblems, () => {
  test('passes manifests that follow every rule', () => {
    assert.deepStrictEqual(
      find([
        member('libs/lib-b/package.json', {
          name: 'lib-b',
          dependencies: { 'lib-a': 'workspace:^', rxjs: '^7.8.0' },
          optionalDependencies: { 'lib-a': 'workspace:~' },
          devDependencies: { 'lib-a': 'workspace:*', eslint: 'catalog:' },
        }),
      ]),
      { findings: [], unusedExemptions: [], exemptedCount: 0 },
    );
  });

  test('reports a workspace member in devDependencies not named by workspace:*', () => {
    assert.deepStrictEqual(
      find([
        member('languages/sumi/cli/package.json', {
          name: '@sumi-lang/cli',
          private: true,
          devDependencies: { 'lib-a': 'workspace:~' },
        }),
      ]).findings,
      [
        'languages/sumi/cli/package.json: devDependencies.lib-a is "workspace:~"; expected "workspace:*" (a workspace member in devDependencies)',
      ],
    );
  });

  test('reports a workspace member in dependencies or optionalDependencies named by a literal range', () => {
    assert.deepStrictEqual(
      find([
        member('libs/lib-b/package.json', {
          name: 'lib-b',
          dependencies: { 'lib-a': '^1.0.0' },
          optionalDependencies: { 'lib-a': 'workspace:^1.0.0' },
        }),
      ]).findings,
      [
        'libs/lib-b/package.json: dependencies.lib-a is "^1.0.0"; expected "workspace:^", "workspace:~" or "workspace:*" (a workspace member)',
        'libs/lib-b/package.json: optionalDependencies.lib-a is "workspace:^1.0.0"; expected "workspace:^", "workspace:~" or "workspace:*" (a workspace member)',
      ],
    );
  });

  test('reports a devDependency with a catalog entry not named by catalog:', () => {
    assert.deepStrictEqual(
      find([
        member('apps/app-a/package.json', {
          name: 'app-a',
          private: true,
          devDependencies: { eslint: '10.0.0', prettier: '3.0.0' },
        }),
      ]).findings,
      [
        'apps/app-a/package.json: devDependencies.eslint is "10.0.0"; expected "catalog:" (pnpm-workspace.yaml has a catalog entry for it)',
      ],
    );
  });

  test('reports catalog: outside devDependencies of a published package', () => {
    assert.deepStrictEqual(
      find([
        member('libs/lib-b/package.json', {
          name: 'lib-b',
          dependencies: { eslint: 'catalog:' },
          peerDependencies: { typescript: 'catalog:' },
        }),
      ]).findings,
      [
        'libs/lib-b/package.json: dependencies.eslint is "catalog:"; expected a literal range (a published package states its own ranges)',
        'libs/lib-b/package.json: peerDependencies.typescript is "catalog:"; expected a literal range (a published package states its own ranges)',
      ],
    );
  });

  test('passes a workspace member in peerDependencies, literal or workspace:', () => {
    assert.deepStrictEqual(
      find([
        member('libs/lib-b/package.json', {
          name: 'lib-b',
          peerDependencies: { 'lib-a': '>=1.0.0' },
        }),
        member('libs/lib-c/package.json', {
          name: 'lib-c',
          peerDependencies: { 'lib-a': 'workspace:^' },
        }),
      ]).findings,
      [],
    );
  });

  test('passes catalog: in the dependencies of a private package', () => {
    assert.deepStrictEqual(
      find([
        member('apps/app-a/package.json', {
          name: 'app-a',
          private: true,
          dependencies: { typescript: 'catalog:' },
        }),
      ]).findings,
      [],
    );
  });

  test('passes catalog:default and a named catalog in devDependencies', () => {
    assert.deepStrictEqual(
      find([
        member('apps/app-a/package.json', {
          name: 'app-a',
          private: true,
          devDependencies: {
            eslint: 'catalog:default',
            typescript: 'catalog:next',
          },
        }),
      ]).findings,
      [],
    );
  });

  test('judges the root manifest and a package with private: false like any other', () => {
    assert.deepStrictEqual(
      find([
        member('package.json', {
          name: 'mono',
          private: true,
          devDependencies: { eslint: '10.0.0' },
        }),
        member('libs/lib-b/package.json', {
          name: 'lib-b',
          private: false,
          peerDependencies: { 'lib-a': 'catalog:' },
        }),
      ]).findings,
      [
        'package.json: devDependencies.eslint is "10.0.0"; expected "catalog:" (pnpm-workspace.yaml has a catalog entry for it)',
        'libs/lib-b/package.json: peerDependencies.lib-a is "catalog:"; expected a literal range (a published package states its own ranges)',
      ],
    );
  });

  test('passes an exempt entry and counts it', () => {
    assert.deepStrictEqual(
      find(
        [
          member('strict-lib/v7.0/package.json', {
            name: 'strict-ts-lib-v7.0-source',
            private: true,
            devDependencies: { typescript: '7.0.2' },
          }),
          member('strict-lib/v6.0/package.json', {
            name: 'strict-ts-lib-v6.0-source',
            private: true,
            devDependencies: { typescript: '6.0.3', eslint: '10.0.0' },
          }),
        ],
        [harnessTypeScript],
      ),
      {
        findings: [
          'strict-lib/v6.0/package.json: devDependencies.eslint is "10.0.0"; expected "catalog:" (pnpm-workspace.yaml has a catalog entry for it)',
        ],
        unusedExemptions: [],
        exemptedCount: 2,
      },
    );
  });

  test('reports a specifier outside the form or the manifests an exemption covers', () => {
    assert.deepStrictEqual(
      find(
        [
          member('strict-lib/v7.0/package.json', {
            name: 'strict-ts-lib-v7.0-source',
            private: true,
            devDependencies: { typescript: '^7.0.0' },
          }),
          member('strict-lib/v6.0/package.json', {
            name: 'strict-ts-lib-v6.0-source',
            private: true,
            devDependencies: { typescript: '6.0.3' },
            dependencies: { 'lib-a': '1.0.0' },
          }),
          member('apps/app-a/package.json', {
            name: 'app-a',
            private: true,
            devDependencies: { typescript: '6.0.3' },
          }),
        ],
        [harnessTypeScript],
      ),
      {
        findings: [
          'strict-lib/v7.0/package.json: devDependencies.typescript is "^7.0.0"; expected an exact version (X.Y.Z or X.Y.Z-<pre>), the form an exemption keeps (each harness pins the TypeScript minor it converts); or, if that reason no longer holds for it, "catalog:" (pnpm-workspace.yaml has a catalog entry for it), with the exemption narrowed or deleted',
          'strict-lib/v6.0/package.json: dependencies.lib-a is "1.0.0"; expected "workspace:^", "workspace:~" or "workspace:*" (a workspace member)',
          'apps/app-a/package.json: devDependencies.typescript is "6.0.3"; expected "catalog:" (pnpm-workspace.yaml has a catalog entry for it)',
        ],
        unusedExemptions: [],
        exemptedCount: 1,
      },
    );
  });

  test('reports the same specifier in a field the exemption does not name', () => {
    const exemption: DependencySpecifierExemption = {
      manifest: /^libs\/lib-b\/package\.json$/u,
      field: 'dependencies',
      dependency: 'lib-a',
      specifier: /^\^1\.0\.0$/u,
      form: 'a ^1.0.0 range',
      reason: 'a reason',
    } as const;

    assert.deepStrictEqual(
      find(
        [
          member('libs/lib-b/package.json', {
            name: 'lib-b',
            dependencies: { 'lib-a': '^1.0.0' },
            optionalDependencies: { 'lib-a': '^1.0.0' },
          }),
        ],
        [exemption],
      ),
      {
        findings: [
          'libs/lib-b/package.json: optionalDependencies.lib-a is "^1.0.0"; expected "workspace:^", "workspace:~" or "workspace:*" (a workspace member)',
        ],
        unusedExemptions: [],
        exemptedCount: 1,
      },
    );
  });

  test('does not report an exemption as unused when a finding names it', () => {
    const { findings, unusedExemptions } = find(
      [
        member('strict-lib/v7.0/package.json', {
          name: 'strict-ts-lib-v7.0-source',
          private: true,
          devDependencies: { typescript: '^7.0.0' },
        }),
      ],
      [harnessTypeScript],
    );

    assert.lengthOf(findings, 1);

    assert.include(findings.join('\n'), 'the form an exemption keeps');

    assert.deepStrictEqual(unusedExemptions, []);
  });

  test('reports an exemption that matches nothing', () => {
    assert.deepStrictEqual(
      find(
        [
          member('strict-lib/v7.0/package.json', {
            name: 'strict-ts-lib-v7.0-source',
            private: true,
            devDependencies: { typescript: 'catalog:' },
          }),
        ],
        [harnessTypeScript],
      ),
      { findings: [], unusedExemptions: [harnessTypeScript], exemptedCount: 0 },
    );
  });
});

describe(parseCatalogNames, () => {
  test('reads the names of the default catalog', () => {
    const result = parseCatalogNames(
      [
        'catalog:',
        "  '@types/node': 26.6.5",
        '  eslint: 10.13.0',
        '',
        'packages:',
        '  - libs/*',
      ].join('\n'),
    );

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(Array.from(result.value), ['@types/node', 'eslint']);
  });

  test('reads catalogs.default and leaves the named catalogs out', () => {
    const result = parseCatalogNames(
      [
        'catalogs:',
        '  default:',
        '    eslint: 10.13.0',
        '  next:',
        '    typescript: 7.0.2',
      ].join('\n'),
    );

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(Array.from(result.value), ['eslint']);
  });

  test('refuses a file YAML cannot parse', () => {
    const result = parseCatalogNames('catalog: [');

    assert.isTrue(Result.isErr(result));

    assert.isTrue(
      result.value.startsWith('Failed to parse pnpm-workspace.yaml: '),
    );
  });

  test('refuses a file with no catalog', () => {
    assert.isTrue(Result.isErr(parseCatalogNames('packages:\n  - libs/*\n')));
  });
});

describe(parseManifest, () => {
  test('reads a manifest', () => {
    assert.deepStrictEqual(
      parseManifest('libs/lib-a/package.json', '{ "name": "lib-a" }'),
      Result.ok({
        relativePath: 'libs/lib-a/package.json',
        manifest: { name: 'lib-a' },
      }),
    );
  });

  test('names the file it cannot parse', () => {
    const result = parseManifest('libs/lib-a/package.json', '{ "name": }');

    assert.isTrue(Result.isErr(result));

    assert.isTrue(result.value.startsWith('libs/lib-a/package.json: '));
  });
});

const judgeWithExemptions = (
  relativePath: string,
  field: string,
  dependency: string,
  specifier: string,
): ReturnType<typeof findDependencySpecifierProblems> =>
  findDependencySpecifierProblems({
    manifests: [
      member('libs/ts-type-forge/package.json', { name: 'ts-type-forge' }),
      member(relativePath, {
        name: 'x',
        private: true,
        [field]: { [dependency]: specifier },
      }),
    ],
    catalogNames: new Set<string>(['typescript']),
    exemptions: EXEMPTIONS,
  });

describe('EXEMPTIONS', () => {
  test.each([
    ['strict-lib/v7.0/package.json', 'devDependencies', 'typescript', '7.0.2'],
    [
      'strict-lib/v7.1/package.json',
      'devDependencies',
      'typescript',
      '7.1.0-beta',
    ],
    [
      'strict-lib/v7.1/package.json',
      'devDependencies',
      'typescript',
      '7.1.0-rc.1',
    ],
    [
      'strict-lib/scripts-common/package.json',
      'devDependencies',
      'typescript',
      '7.1.0-beta',
    ],
    [
      'strict-lib/v7.0/output/lib/package.json',
      'dependencies',
      'ts-type-forge',
      '^9.0.0',
    ],
  ] as const)(
    'exempts %s %s.%s "%s"',
    (relativePath, field, dependency, specifier) => {
      const { findings, exemptedCount } = judgeWithExemptions(
        relativePath,
        field,
        dependency,
        specifier,
      );

      assert.deepStrictEqual(findings, []);

      assert.strictEqual(exemptedCount, 1);
    },
  );

  // The last column: the form the finding names, for an entry an exemption
  // names in another form, or undefined.
  test.each([
    [
      'strict-lib/v7.0/package.json',
      'devDependencies',
      'typescript',
      '^7.0.2',
      EXACT_VERSION.form,
    ],
    [
      'strict-lib/v7.0/package.json',
      'devDependencies',
      'typescript',
      '7.0.0-',
      EXACT_VERSION.form,
    ],
    [
      'strict-lib/v7.0/package.json',
      'devDependencies',
      'typescript',
      '=7.0.2',
      EXACT_VERSION.form,
    ],
    [
      'strict-lib/v7.0/package.json',
      'devDependencies',
      'typescript',
      '7.0.2+build.1',
      EXACT_VERSION.form,
    ],
    [
      'strict-lib/scripts-common/package.json',
      'devDependencies',
      'typescript',
      '~6.0.3',
      EXACT_VERSION.form,
    ],
    [
      'strict-lib/v7.0/output/lib/package.json',
      'dependencies',
      'ts-type-forge',
      '^9.1.0',
      'a ^<major>.0.0 range',
    ],
    [
      'apps/app-a/package.json',
      'devDependencies',
      'typescript',
      '6.0.3',
      undefined,
    ],
  ] as const)(
    'does not exempt %s %s.%s "%s"',
    (relativePath, field, dependency, specifier, namesForm) => {
      const { findings, exemptedCount } = judgeWithExemptions(
        relativePath,
        field,
        dependency,
        specifier,
      );

      assert.lengthOf(findings, 1);

      assert.strictEqual(exemptedCount, 0);

      assert.strictEqual(
        findings.join('\n').includes('the form an exemption keeps'),
        namesForm !== undefined,
      );

      if (namesForm !== undefined) {
        assert.include(
          findings.join('\n'),
          `expected ${namesForm}, the form an exemption keeps`,
        );
      }
    },
  );
});
