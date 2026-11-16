import { Arr, Result } from 'ts-data-forge';
import {
  aliasProblems,
  excludedDependencies,
  npmAliasesOf,
} from './check-npm-alias-updates.mjs';

describe(npmAliasesOf, () => {
  test('reads the npm: specifiers of each dependency field, scoped ones included', () => {
    assert.deepStrictEqual(
      npmAliasesOf('libs/x/package.json', {
        dependencies: { 'ts-data-forge': 'workspace:^' },
        devDependencies: {
          'react-17': 'npm:react@17.0.2',
          '@testing-library/react-12': 'npm:@testing-library/react@12.1.5',
          vitest: 'catalog:',
        },
        optionalDependencies: { 'x-latest': 'npm:x' },
      }),
      [
        {
          file: 'libs/x/package.json',
          alias: 'react-17',
          target: 'react',
        },
        {
          file: 'libs/x/package.json',
          alias: '@testing-library/react-12',
          target: '@testing-library/react',
        },
        { file: 'libs/x/package.json', alias: 'x-latest', target: 'x' },
      ],
    );
  });

  test('reads nothing from a manifest that is not an object', () => {
    assert.deepStrictEqual(npmAliasesOf('package.json', []), []);
  });
});

describe(excludedDependencies, () => {
  test("takes each `!<name>` of the pnpm update, but a --filter's value", () => {
    const excluded = excludedDependencies(
      "pnpm update --latest --recursive --filter '!./strict-lib/v*/output/lib' '!react-16' '!@testing-library/react-12'",
    );

    assert.isTrue(Result.isOk(excluded));

    assert.deepStrictEqual(Array.from(excluded.value), [
      'react-16',
      '@testing-library/react-12',
    ]);
  });

  test('refuses a script that runs no pnpm update', () => {
    assert.isTrue(Result.isErr(excludedDependencies('pnpm install')));
  });
});

describe(aliasProblems, () => {
  const aliases = [
    { file: 'libs/a/package.json', alias: 'react-17', target: 'react' },
    {
      file: 'libs/b/package.json',
      alias: 'typescript-native',
      target: 'typescript',
    },
  ] as const;

  test('takes an alias excluded by name, and one whose package ignoreDeps holds back', () => {
    assert.deepStrictEqual(
      aliasProblems({
        aliases,
        excluded: new Set<string>(['react-17']),
        ignoreDeps: new Set<string>(['typescript']),
      }),
      [],
    );
  });

  test('names an alias that is neither', () => {
    assert.deepStrictEqual(
      aliasProblems({
        aliases,
        excluded: new Set<string>(),
        ignoreDeps: new Set<string>(['typescript']),
      }),
      [
        "libs/a/package.json: `react-17` (npm:react) is neither excluded by `'!react-17'` nor held back by `ignoreDeps`.",
      ],
    );
  });

  test.each([
    ['react-*', 'react-17', true],
    ['react-*', 'preact', false],
    ['*-17', 'react-dom-17', true],
    ['r*-dom-*', 'react-dom-16', true],
    ['react-1*7', 'react-17', true],
    ['react-17', 'react-17', true],
    ['react-17', 'react-170', false],
  ] as const)('%s excludes %s: %s', (pattern, alias, excludedByIt) => {
    assert.strictEqual(
      Arr.isEmpty(
        aliasProblems({
          aliases: [{ file: 'package.json', alias, target: 'x' }],
          excluded: new Set<string>([pattern]),
          ignoreDeps: new Set<string>(),
        }),
      ),
      excludedByIt,
    );
  });

  test('takes an alias a pattern excludes, as pnpm update reads one', () => {
    assert.deepStrictEqual(
      aliasProblems({
        aliases,
        excluded: new Set<string>(['react-*']),
        ignoreDeps: new Set<string>(['typescript']),
      }),
      [],
    );
  });

  // ignoreDeps matches the real name, never the alias (pnpm 12.15).
  test('does not take an alias that ignoreDeps names by its alias', () => {
    assert.lengthOf(
      aliasProblems({
        aliases,
        excluded: new Set<string>(),
        ignoreDeps: new Set<string>(['react-17', 'typescript']),
      }),
      1,
    );
  });
});
