// cspell:ignore testw

import * as fs from 'node:fs';
import * as path from 'node:path';
import { Arr, isRecord, Result, unknownToString } from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import { hasTestFiles } from '../../configs/vite-config.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a workspace member does not define the scripts the root sweeps run
 * by name, or defines one under a legacy name.
 *
 * Every `ws:check:*` and `ws:fix:lint*` sweep is `pnpm run --recursive
 * --if-present <name>`, so a member that names its type check `type-check`
 * rather than `check:types` is skipped without a word, and its type errors,
 * lint violations and failing tests reach `main` with `code-check` green. That
 * happened once, to a Chrome extension that landed with `type-check`, `lint`,
 * `lint:fix` and `testw` (#1946); a package restored from `experimental/` or
 * copied from an older template brings the old names with it.
 *
 * What a member has decides what it must define:
 *
 * - a `tsconfig.json`: `check:types`;
 * - an `eslint.config.mts`: `check:lint` and `fix:lint`;
 * - test files (as `vite-config.mts`'s `hasTestFiles` counts them, the same
 *   question the Vitest config asks): `check:test`;
 * - test files under `test/browser/`: `check:test:browser`, which
 *   `ws:check:test:browser` sweeps.
 */
export const checkRequiredScripts = async (): Promise<
  Result<number, string>
> => {
  const members = await getWorkspacePackages(projectRootPath);

  const offenders = members.flatMap((member) =>
    findScriptProblems({
      scripts: readScriptNames(member.packageJson),
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a workspace member's own directory.
      hasTsconfig: fs.existsSync(path.join(member.path, 'tsconfig.json')),
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a workspace member's own directory.
      hasEslintConfig: fs.existsSync(
        path.join(member.path, 'eslint.config.mts'),
      ),
      hasTests: hasTestFiles(member.path),
      hasBrowserTests: Arr.isNonEmpty(
        fs.globSync(BROWSER_TESTS, {
          cwd: member.path,
          exclude: (file) => file.includes('node_modules'),
        }),
      ),
    }).map(
      (problem) => `${path.relative(projectRootPath, member.path)}: ${problem}`,
    ),
  );

  return Arr.isNonEmpty(offenders)
    ? Result.err(
        [
          '❌ These workspace members would be skipped by the `--if-present` sweeps (`ws:check:types`, `ws:fix:lint`, `ws:check:test*`):',
          ...offenders.map((offender) => `  - ${offender}`),
          'Define each missing script under the name given, as the other members do, and rename a legacy one rather than keeping both.',
        ].join('\n'),
      )
    : Result.ok(members.length);
};

/** What one member's scripts lack, given what the member has. */
export const findScriptProblems = ({
  scripts,
  hasTsconfig,
  hasEslintConfig,
  hasTests,
  hasBrowserTests,
}: Readonly<{
  scripts: ReadonlySet<string>;
  hasTsconfig: boolean;
  hasEslintConfig: boolean;
  hasTests: boolean;
  hasBrowserTests: boolean;
}>): readonly string[] => {
  const required = [
    ...(hasTsconfig ? (['check:types'] as const) : ([] as const)),
    ...(hasEslintConfig
      ? (['check:lint', 'fix:lint'] as const)
      : ([] as const)),
    ...(hasTests ? (['check:test'] as const) : ([] as const)),
    ...(hasBrowserTests ? (['check:test:browser'] as const) : ([] as const)),
  ] as const;

  return [
    ...required
      .filter((name) => !scripts.has(name))
      .map((name) => `missing \`${name}\``),
    ...Object.entries(LEGACY_NAMES)
      .filter(([legacy]) => scripts.has(legacy))
      .map(
        ([legacy, current]) =>
          `\`${legacy}\` is a legacy name; the sweeps run \`${current}\``,
      ),
  ];
};

const BROWSER_TESTS = 'test/browser/**/*.test.{mts,ts,tsx}';

/** Names older templates used, and the name the sweeps run instead. */
const LEGACY_NAMES = {
  'type-check': 'check:types',
  lint: 'check:lint',
  'lint:fix': 'fix:lint',
  gi: 'gen',
  testw: 'watch:test',
} as const;

const readScriptNames = (manifest: unknown): ReadonlySet<string> =>
  new Set<string>(
    isRecord(manifest) && isRecord(manifest['scripts'])
      ? Object.keys(manifest['scripts'])
      : [],
  );

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkRequiredScripts().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `✅ All ${result.value} workspace members define the scripts the sweeps run.`,
  );
}
