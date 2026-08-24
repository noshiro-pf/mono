import * as path from 'node:path';
import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';

const strictLibDir = import.meta.dirname;

/**
 * The pnpm workspace root. `strict-lib/` is a directory, not a package, so the
 * manifest that declares what `strict-lib/scripts/**` may import is the root
 * one — that is what `import-x/no-extraneous-dependencies` has to read.
 */
const workspaceRoot = path.resolve(strictLibDir, '..');

/**
 * Rule overrides shared by all build-tooling / source files in this repository
 * (root scripts & configs, per-version generators, the shared generator
 * library). Individual `files`-scoped blocks below layer more on top.
 */
const commonNodeRuleOverrides = defineKnownRules({
  '@typescript-eslint/explicit-function-return-type': 'off',
  'no-await-in-loop': 'off',
  'import-x/no-unassigned-import': 'off',
  'import-x/no-internal-modules': 'off',
  'import-x/no-default-export': 'off',
  'import-x/no-extraneous-dependencies': 'off',
  'security/detect-non-literal-fs-filename': 'off',
});

/**
 * Every build-tooling source path under `strict-lib/`. The version directories
 * are homogeneous (each `vX.Y` differs only by the pinned TypeScript version),
 * so this one config lints them all; there is no per-directory
 * `eslint.config.mts`.
 */
const toolingFiles = [
  'strict-lib/scripts/**',
  'strict-lib/configs/**',
  'strict-lib/eslint.config.mts',
  'strict-lib/scripts-common/src/**',
  'strict-lib/v*/scripts/**',
] as const;

/**
 * The flat ESLint config for `strict-lib/`, run by `strict-lib:lint` from the
 * repository root. The rest of the repository is linted per package.
 *
 * Typed linting resolves against `tsconfig.tooling.json`, which includes all of
 * {@link toolingFiles} and uses the stock lib. The generated strict lib is
 * validated separately via each `vX.Y/tsconfig.lib-check*.json`.
 */
const config: readonly FlatConfig[] = [
  {
    ignores: [
      '**/temp/**',
      '**/output/**',
      '**/output-branded/**',
      'strict-lib/v*/output*/**',
    ],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: strictLibDir,
    tsconfigFileName: 'tsconfig.tooling.json',
    packageDirs: [workspaceRoot],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  eslintConfigForNodeJs(toolingFiles),
  {
    files: toolingFiles,
    rules: defineKnownRules(commonNodeRuleOverrides),
  },
  {
    // Root build tooling operates on trusted, repo-local paths.
    files: [
      'strict-lib/scripts/**',
      'strict-lib/configs/**',
      'strict-lib/eslint.config.mts',
    ],
    rules: defineKnownRules({
      'functional/immutable-data': 'off',
    }),
  },
  {
    // Per-version generator entry points (thin wrappers over scripts-common).
    files: ['strict-lib/v*/scripts/**'],
    rules: defineKnownRules({
      'total-functions/no-unsafe-type-assertion': 'off',
    }),
  },
  {
    // Shared generator library: imperative code operating on trusted paths.
    files: ['strict-lib/scripts-common/src/**'],
    rules: defineKnownRules({
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      'import-x/first': 'off',
      'security/detect-non-literal-regexp': 'off',
      'security/detect-child-process': 'off',
      'no-restricted-syntax': 'off',
      'functional/immutable-data': 'off',
      'functional/no-let': 'off',
      'functional/no-loop-statements': 'off',
      'functional/no-throw-statements': 'off',
      'functional/no-conditional-statements': 'off',
      'functional/no-expression-statements': 'off',
      'functional/no-return-void': 'off',
      'total-functions/no-unsafe-type-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-restricted-types': 'off',
      'no-template-curly-in-string': 'off',
    }),
  },
] as const;

export default config;
