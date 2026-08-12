import typescriptEslintParser from '@typescript-eslint/parser';
import { type FlatConfig } from 'eslint-config-typed';
import { hasKey, isRecord } from 'ts-data-forge';
/* eslint-disable-next-line import-x/no-rename-default */
import eslintPluginImportX from 'eslint-plugin-import-x';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { projectRootPath } from '../scripts/project-root-path.mjs';

/**
 * A second, narrow ESLint pass over what the packages actually publish.
 *
 * The repository-wide config allows a file to import anything the package
 * declares, in any group. That is right for tests and scripts, but it lets a
 * module under `src/` import a devDependency — which resolves during
 * development and then fails for consumers, who never install it. Two packages
 * shipped that way before this check existed: `github-settings-as-code`
 * imported `ts-repo-utils` from fourteen modules, and `eslint-config-typed`
 * imported a type from `@eslint/core`.
 *
 * `packageDir` has to name one package, otherwise a dependency declared by any
 * package would satisfy every other, so the config is generated per package.
 * The rule is not type-aware, so this pass needs no TypeScript program and
 * stays fast.
 *
 * Run with `pnpm run lint:published-deps`.
 */
/** `true` for a directory holding a package that gets published. */
const isPublishedPackage = (dir: string): boolean => {
  const manifestPath = path.resolve(dir, 'package.json');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(manifestPath)) return false;

  const manifest: unknown = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(manifestPath, 'utf8'),
  );

  return (
    isRecord(manifest) &&
    (!hasKey(manifest, 'private') || manifest.private !== true)
  );
};

const publishedPackageDirs = ['libs', 'apps'].flatMap((group) => {
  const groupDir = path.resolve(projectRootPath, group);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const entries = fs.readdirSync(groupDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.resolve(groupDir, entry.name))
    .filter(isPublishedPackage);
});

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.test.mts'],
  },

  {
    // The rule is not type-aware, so the parser needs no TypeScript program —
    // this pass stays a syntax-only walk.
    // The rule silently skips anything it cannot resolve, and the default
    // resolver cannot resolve a types-only package — `@eslint/core` ships
    // nothing but declarations, and went unnoticed until this was set.
    settings: { 'import-x/resolver': { typescript: true } },

    // Inline directives belong to the repository-wide pass. Here they could
    // only weaken the check, and every rule this config does not define would
    // be reported as unknown.
    linterOptions: { noInlineConfig: true },

    languageOptions: { parser: typescriptEslintParser },
    plugins: { 'import-x': eslintPluginImportX },
  },

  ...publishedPackageDirs.map(
    (dir) =>
      ({
        files: [`${path.relative(projectRootPath, dir)}/src/**/*.{mts,ts,tsx}`],
        rules: {
          'import-x/no-extraneous-dependencies': [
            'error',
            {
              // One package per config object: passing every package
              // directory would let a dependency declared anywhere satisfy
              // everywhere.
              packageDir: [dir],
              // The point of this pass — what a package publishes may only
              // reach for what its consumers are given.
              devDependencies: false,
              optionalDependencies: false,
              peerDependencies: true,
              includeTypes: true,
            },
          ],
        },
      }) as const satisfies FlatConfig,
  ),
] as const satisfies readonly FlatConfig[];
