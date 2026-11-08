import typescriptEslintParser from '@typescript-eslint/parser';
import type { FlatConfig } from 'eslint-config-typed';
import { hasKey, isRecord } from 'ts-data-forge';
/* eslint-disable-next-line import-x/no-rename-default */
import eslintPluginImportX from 'eslint-plugin-import-x';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { projectRootPath } from '../scripts/project-root-path.mjs';

/**
 * A second, narrow ESLint pass, for the two dependency questions the
 * repository-wide config cannot answer.
 *
 * **What a package publishes may import.** The repository-wide config allows a
 * file to import anything the package declares, in any group. That is right for
 * tests and scripts, but it lets a module under `src/` import a devDependency —
 * which resolves during development and then fails for consumers, who never
 * install it. Two packages shipped that way before this check existed:
 * `github-settings-as-code` imported `ts-repo-utils` from fourteen modules, and
 * `eslint-config-typed` imported a type from `@eslint/core`.
 *
 * **What `eslint.config.mts` imports.** `eslint-config-typed` ignores those
 * files by default, so the repository-wide pass never sees them and the
 * packages they import — `eslint-config-typed` itself, the `eslint-plugin-ts-*`
 * trio — were declared by hand and checked by nobody. Here every tracked one
 * outside `experimental/` is covered like any other file, against the nearest
 * `package.json`, with devDependencies allowed, because that is what a lint
 * config legitimately reaches for.
 *
 * For `src/`, `packageDir` has to name one package, otherwise a dependency
 * declared by any package would satisfy every other, so that part of the config
 * is generated per package. The rule is not type-aware, so this pass needs no
 * TypeScript program and stays fast.
 *
 * Run with `pnpm run check:published-deps`.
 */

/** `true` for a directory holding a package that gets published. */
const isPublishedPackage = (dir: string): boolean => {
  const manifestPath = path.resolve(dir, 'package.json');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(manifestPath)) {
    return false;
  }

  const manifest: unknown = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(manifestPath, 'utf8'),
  );

  return (
    isRecord(manifest) &&
    (!hasKey(manifest, 'private') || manifest.private !== true)
  );
};

const workspacePackageDirs = ['libs', 'apps'].flatMap((group) => {
  const groupDir = path.resolve(projectRootPath, group);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const entries = fs.readdirSync(groupDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.resolve(groupDir, entry.name));
});

const publishedPackageDirs = workspacePackageDirs.filter(isPublishedPackage);

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

  {
    // Every `eslint.config.mts` the root `check:published-deps` script hands
    // ESLint, whatever its directory: ESLint skips a file no config object
    // names, and `--quiet` hides that it did. The script names the directories
    // so that ESLint does not walk the whole tree, and
    // `eslint.published-deps.test.mts` fails on a tracked config they miss.
    // Ahead of the `src/` objects, so that one of those wins for a file both
    // name.
    files: ['**/eslint.config.mts'],
    rules: {
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          // Left out, `packageDir` is the nearest `package.json` up from the
          // file: its own package's, or the root's for
          // `strict-lib/eslint.config.mts`, which is in no member.
          // A lint config is development tooling, so unlike `src/` below it may
          // import a devDependency — it just has to declare it.
          devDependencies: true,
          optionalDependencies: false,
          peerDependencies: true,
          includeTypes: true,
          // A workspace package imported from a config checked against the root
          // manifest (the root's own, `strict-lib/`'s, any other outside a
          // member) resolves inside the root, which the rule otherwise takes
          // for a module of its own and skips. Set for every config, so that
          // none is missed: an alias, a `#` import or a package importing
          // itself by name, which none does, would be reported, never skipped.
          includeInternal: true,
        },
      ],
    },
  },

  ...publishedPackageDirs.map(
    (dir) =>
      ({
        files: [`${path.relative(projectRootPath, dir)}/src/**/*.{mts,ts,tsx}`],
        rules: {
          'import-x/no-extraneous-dependencies': [
            'error',
            {
              // One package per config object: passing every package directory
              // would let a dependency declared anywhere satisfy everywhere.
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
