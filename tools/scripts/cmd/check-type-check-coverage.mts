import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import * as ts from 'typescript';
import { listTrackedFiles } from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails on a tracked TypeScript or JavaScript file that no tracked
 * `tsconfig*.json` names as a root, and on an exemption that exempts nothing.
 *
 * A file in no program is type-checked by nothing: an error in it fails no
 * check until the file is run. A new configuration file at a path no `include`
 * names is the usual way one appears.
 *
 * Buildless: it reads each config's root files (`files`, `include`, `exclude`),
 * not what a program loads through imports, so it needs no `dist/`. A file
 * counts as covered when any tracked config names it, whether or not a
 * `check:types` script runs that config.
 *
 * `experimental/` and `docs/` are left alone (`OUT_OF_SCOPE`).
 */
export const checkTypeCheckCoverage = async (): Promise<
  Result<number, string>
> => {
  const tracked = await listTrackedFiles();

  if (Result.isErr(tracked)) {
    return Result.err(`❌ ${tracked.value}`);
  }

  const covered = new Set(
    tracked.value
      .filter((file) => !isOutOfScope(file) && isTsconfig(file))
      .flatMap((tsconfig) =>
        rootFilesOf(path.resolve(projectRootPath, tsconfig)).map((file) =>
          path.relative(projectRootPath, file).replaceAll(path.sep, '/'),
        ),
      ),
  );

  const { uncovered, staleExemptions } = findUncoveredFiles(
    tracked.value,
    covered,
    EXEMPTIONS,
  );

  if (Arr.isNonEmpty(uncovered) || Arr.isNonEmpty(staleExemptions)) {
    return Result.err(
      [
        ...(Arr.isNonEmpty(uncovered)
          ? [
              `❌ ${uncovered.length} tracked file(s) that no tsconfig*.json names, so nothing type-checks them:`,
              '',
              ...uncovered.map((file) => `  ${file}`),
              '',
              'Add each to the `include` of the tsconfig whose check covers its directory, or, when it cannot be type-checked, to `EXEMPTIONS` in tools/scripts/cmd/check-type-check-coverage.mts with the reason.',
            ]
          : []),
        ...(Arr.isNonEmpty(staleExemptions)
          ? [
              ...(Arr.isNonEmpty(uncovered) ? [''] : []),
              `❌ ${staleExemptions.length} exemption(s) in tools/scripts/cmd/check-type-check-coverage.mts that exempt no file:`,
              '',
              ...staleExemptions.map((pattern) => `  ${pattern}`),
              '',
              'Remove each from `EXEMPTIONS`.',
            ]
          : []),
      ].join('\n'),
    );
  }

  return Result.ok(tracked.value.length);
};

/**
 * The tracked code files in scope that no config names and no exemption covers,
 * and the exemptions that cover no such file.
 */
export const findUncoveredFiles = (
  trackedFiles: readonly string[],
  covered: ReadonlySet<string>,
  exemptions: readonly Exemption[],
): Readonly<{
  uncovered: readonly string[];
  staleExemptions: readonly string[];
}> => {
  const notCovered = trackedFiles.filter(
    (file) =>
      CODE_EXTENSIONS.has(path.posix.extname(file)) &&
      !isOutOfScope(file) &&
      !covered.has(file),
  );

  return {
    uncovered: notCovered.filter((file) =>
      exemptions.every(({ pattern }) => !path.posix.matchesGlob(file, pattern)),
    ),
    staleExemptions: exemptions
      .filter(({ pattern }) =>
        notCovered.every((file) => !path.posix.matchesGlob(file, pattern)),
      )
      .map(({ pattern }) => pattern),
  };
};

/** A glob (`path.matchesGlob`) whose files are not type-checked as roots, and why. */
export type Exemption = Readonly<{ pattern: string; reason: string }>;

/**
 * Left alone: `experimental/` is never installed or checked, and
 * `code-check.yml`'s gate ignores `docs/`, so a change there alone never runs
 * this guard and what it got wrong would fail an unrelated pull request. Not
 * the gate's whole list: it also ignores `.markdownlint-cli2.mjs`, which the
 * root `tsconfig.json` names.
 */
const OUT_OF_SCOPE = ['experimental/', 'docs/'] as const;

const CODE_EXTENSIONS: ReadonlySet<string> = new Set<string>([
  '.ts',
  '.mts',
  '.cts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.jsx',
]);

const EXEMPTIONS: readonly Exemption[] = [
  {
    pattern: 'strict-lib/v*/output/**',
    reason:
      "The generated standard library, checked by the harnesses' `tsconfig.lib-check*.json` through `lib` replacement rather than as root files.",
  },
  {
    pattern: 'strict-lib/v*/temp/copied/**',
    reason: "TypeScript's own lib files, copied as the converter's input.",
  },
  {
    pattern: 'strict-lib/scripts-common/assets/link-libs.mjs',
    reason:
      'Copied verbatim into every published bundle as plain JavaScript with no type annotations; adding them changes what twelve packages ship.',
  },
  {
    pattern: 'verify-npm-packages/smoke/**',
    reason:
      "Hand-written checks run against what the packages publish, installed in a check space; type-checked from here, their imports would resolve to this checkout's packages instead.",
  },
  {
    pattern: 'verify-npm-packages/local/**',
    reason: 'Generated from `smoke/` by `gen:verify-npm-packages`.',
  },
  {
    pattern: 'verify-npm-packages/published/**',
    reason: 'Generated from `smoke/` by `gen:verify-npm-packages`.',
  },
  ...[
    'synstate-docs',
    'synstate-dom-docs',
    'synstate-dom-next-docs',
    'synstate-next-docs',
  ].map((app) => ({
    pattern: `apps/${app}/src/content.config.ts`,
    reason:
      "Imports `astro:content`, a module only Astro's own type generation declares; the app's `tsconfig.json` excludes it.",
  })),
] as const;

/** The files a tsconfig names as roots. Nothing is resolved or built. */
const rootFilesOf = (tsconfigPath: string): readonly string[] =>
  ts.getParsedCommandLineOfConfigFile(
    tsconfigPath,
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined },
  )?.fileNames ?? [];

const isOutOfScope = (file: string): boolean =>
  OUT_OF_SCOPE.some((dir) => file.startsWith(dir));

const isTsconfig = (file: string): boolean =>
  /^tsconfig.*\.json$/u.test(path.posix.basename(file));

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkTypeCheckCoverage().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} tracked file(s) listed; every TypeScript and JavaScript file in scope is named by a tsconfig or exempt.`,
  );
}
