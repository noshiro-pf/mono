import typescriptEslintParser from '@typescript-eslint/parser';
import { defaultConditionNames } from 'eslint-import-resolver-typescript';
import globals from 'globals';
import { Arr, isUint32 } from 'ts-data-forge';
import { versionMajorMinor } from 'typescript';
import { type FlatConfig } from '../types/index.mjs';
import { plugins } from './plugins.mjs';

export const eslintConfigForTypeScriptWithoutRules = ({
  tsconfigFileName,
  tsconfigRootDir,
}: Readonly<{
  tsconfigFileName: string;
  tsconfigRootDir: string;
}>): readonly FlatConfig[] =>
  [
    {
      ignores: [
        '**/eslint.config.{js,ts,mjs,mts,cjs,cts}',
        '**/eslint.config.*.{js,ts,mjs,mts,cjs,cts}',
        '**/eslint.*.config.{js,ts,mjs,mts,cjs,cts}',
        '**/node_modules',
        '**/dist',
        '**/build',
        '**/coverage',
      ],
    },
    {
      languageOptions: {
        ecmaVersion: 'latest',
        parser: typescriptEslintParser,
        parserOptions: {
          project: tsconfigFileName,
          tsconfigRootDir,
          ecmaVersion: 'latest',
          ecmaFeatures: {
            modules: true,
            impliedStrict: true,
            jsx: true,
          },
          jsxPragma: null, // for @typescript/eslint-parser
          sourceType: 'module',
        },
        globals: {
          ...globals.es2021,
        },
      },
      linterOptions: {
        noInlineConfig: false,
        reportUnusedDisableDirectives: true,
      },
      plugins,
      settings: {
        ...eslintPluginImportXSettings,
      },
    },
  ] as const;

// Omit `.d.ts` because 1) TypeScript compilation already confirms that
// types are resolved, and 2) it would mask an unresolved
// `.ts`/`.tsx`/`.js`/`.jsx` implementation.
const typeScriptExtensions = ['.ts', '.tsx', '.cts', '.mts'] as const;

const allExtensions = [
  ...typeScriptExtensions,
  '.js',
  '.jsx',
  '.cjs',
  '.mjs',
] as const;

/**
 * Every `types@>=X.Y` from `1.0` up to `majorMinor`.
 *
 * Minors are enumerated `0`-`9` for each major below the current one. Some of
 * those releases never existed — there was no TypeScript 1.2 — which costs
 * nothing: a condition name only ever matches a key some package chose to
 * write. The order is not significant either, because the resolver tests a
 * package's `exports` keys against these as a set.
 *
 * A version that does not parse as two non-negative integers yields nothing,
 * rather than throwing: this runs while the ESLint config is being built.
 */
const buildVersionedTypesConditionNames = (
  majorMinor: string,
): readonly string[] => {
  const [majorStr, minorStr] = majorMinor.split('.', 2);

  const major = Number(majorStr);

  const minor = Number(minorStr);

  if (!isUint32(major) || !isUint32(minor)) {
    return [];
  }

  return Arr.seq(major).flatMap((majorIndex) => {
    const majorCandidate = majorIndex + 1;

    // The current major stops at the minor in use; every earlier one is
    // complete, and 9 is the highest minor TypeScript has ever shipped.
    const highestMinor = majorCandidate === major ? minor : 9;

    return Arr.seq(10)
      .filter((minorCandidate) => minorCandidate <= highestMinor)
      .map((minorCandidate) => `types@>=${majorCandidate}.${minorCandidate}`);
  });
};

/**
 * The `types@>=X.Y` export conditions that the running TypeScript satisfies.
 *
 * A package may choose its declaration file by the compiler's own version:
 * jotai 3 ships `"types@>=5.5": "./dist/index.d.ts"` alongside a plain
 * `"types"` pointing at a stub whose whole content is its own file name,
 * `ts_version_5.5_and_above_is_required.d.ts`. TypeScript reads the versioned
 * key. The resolver behind `import-x/resolver: { typescript: ... }` matches
 * condition names as literal strings and knows nothing about versions, so it
 * takes the plain `types` branch and resolves *every* subpath of such a
 * package — `jotai`, `jotai/utils`, `jotai/vanilla` — to that one stub.
 *
 * Nothing reports the mis-resolution itself; what fails is a rule two steps
 * away from it. Two imports from one package become the same module to
 * `import-x/no-duplicates`, and its fixer merges them into a single import
 * naming things the entry point does not export — so `--fix` turns a resolver
 * gap into broken source.
 *
 * Hence the conditions are stated outright, bounded by the TypeScript that is
 * actually running: a consumer on 5.4 must still get the stub that says so.
 * Only the `>=` form is generated — `types@<X.Y` means the opposite, and
 * claiming it would pick the stub deliberately.
 */
const versionedTypesConditionNames: readonly string[] =
  buildVersionedTypesConditionNames(versionMajorMinor);

// https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/src/config/typescript.ts

/**
 * This config:
 *
 * 1. Adds `.jsx`, `.ts`, `.cts`, `.mts`, and `.tsx` as an extension
 * 2. Enables JSX/TSX parsing
 */
const eslintPluginImportXSettings = {
  'import-x/extensions': allExtensions,
  'import-x/external-module-folders': ['node_modules', 'node_modules/@types'],
  'import-x/parsers': {
    '@typescript-eslint/parser': typeScriptExtensions,
  },
  'import-x/resolver': {
    typescript: {
      conditionNames: [
        ...versionedTypesConditionNames,
        ...defaultConditionNames,
      ],
    },
    // node: {
    //   extensions: [
    //     '.test.ts',
    //     '.js',
    //     '.ts',
    //     '.mjs',
    //     '.mts',
    //     '.cjs',
    //     '.cts',
    //     '.jsx',
    //     '.tsx',
    //   ],
    // },
  },
} as const;

if (import.meta.vitest !== undefined) {
  describe('buildVersionedTypesConditionNames', () => {
    test('claims every minor up to the running one, and none above it', () => {
      const result = buildVersionedTypesConditionNames('6.0');

      expect(result).toContain('types@>=5.5'); // what jotai 3 declares

      expect(result).toContain('types@>=6.0');

      expect(result).not.toContain('types@>=6.1');

      expect(result).not.toContain('types@>=7.0');
    });

    test('an older compiler does not claim a newer condition', () => {
      // The stub jotai points `types` at is correct for 5.4 — it says which
      // TypeScript is required — so the condition must not be claimed there.
      expect(buildVersionedTypesConditionNames('5.4')).not.toContain(
        'types@>=5.5',
      );
    });

    test('generates only the `>=` form', () => {
      assert.isTrue(
        buildVersionedTypesConditionNames('6.0').every((name) =>
          name.startsWith('types@>='),
        ),
      );
    });

    test('a version that is not two non-negative integers claims nothing', () => {
      assert.deepStrictEqual(buildVersionedTypesConditionNames('next'), []);

      assert.deepStrictEqual(buildVersionedTypesConditionNames(''), []);

      assert.deepStrictEqual(buildVersionedTypesConditionNames('6'), []);

      // Returned, not thrown: this runs while the config is being built.
      assert.deepStrictEqual(buildVersionedTypesConditionNames('-1.0'), []);
    });
  });
}
