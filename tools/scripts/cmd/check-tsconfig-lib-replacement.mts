import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, hasKey, isRecord, Result, unknownToString } from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import * as ts from 'typescript';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a workspace member's `tsconfig.json`, or the root one, does not
 * say whether it is type-checked against the strict standard library.
 *
 * `libReplacement` defaults to `false` in TypeScript 6 and 7, and a package
 * that leaves it out is silently checked against the stock library — nothing
 * fails. That is how thirty packages added after the migration (#1737) went
 * unchecked until #2484. So the value is stated in every `tsconfig.json`, in
 * the file itself rather than inherited, and a `false` carries the reason on
 * the line above it or after it, as `libs/ts-type-forge/tsconfig.json` does.
 * See docs/strict-typescript-lib-integration.md.
 *
 * A member with no `tsconfig.json` (the strict library's own bundles and
 * harnesses) has nothing to declare.
 */
export const checkTsconfigLibReplacement = async (): Promise<
  Result<number, string>
> => {
  const packages = await getWorkspacePackages(projectRootPath);

  const candidates = Arr.toUnshifted(projectRootPath)(
    packages.map((pkg) => pkg.path),
  ).map((dir) => path.join(dir, 'tsconfig.json'));

  const files = await Promise.all(
    candidates.map(async (file) => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const content = await Result.fromPromise(fs.readFile(file, 'utf8'));

      return Result.isOk(content)
        ? ({
            relativePath: path.relative(projectRootPath, file),
            content: content.value,
          } as const)
        : undefined;
    }),
  );

  const present = files.filter((file) => file !== undefined);

  const violations = findLibReplacementViolations(present);

  if (Arr.isNonEmpty(violations)) {
    return Result.err(
      [
        `❌ ${violations.length} tsconfig.json file(s) leave the strict standard library to chance:`,
        '',
        ...violations.map(
          ({ relativePath, problem }) =>
            `  ${relativePath}: ${problemText[problem]}`,
        ),
        '',
        'State `"libReplacement": true` in `compilerOptions` and add a',
        '`test/strict-lib-active.mts` probe (see',
        '`libs/octokit-safe-types/test/strict-lib-active.mts`), or state',
        '`"libReplacement": false` with a comment saying why. See',
        'docs/strict-typescript-lib-integration.md.',
      ].join('\n'),
    );
  }

  return Result.ok(present.length);
};

type Problem = 'false-without-reason' | 'not-boolean' | 'undeclared';

type Violation = Readonly<{
  relativePath: string;
  problem: Problem;
}>;

const problemText = {
  undeclared:
    '`compilerOptions.libReplacement` is not set, so it is `false` by default.',
  'not-boolean': '`compilerOptions.libReplacement` is not `true` or `false`.',
  'false-without-reason':
    '`"libReplacement": false` has no comment saying why.',
} as const satisfies ReadonlyRecord<Problem, string>;

/**
 * The files among `files` that do not state `libReplacement` as a boolean, or
 * state `false` without a comment on its line or the line above.
 */
export const findLibReplacementViolations = (
  files: readonly Readonly<{ relativePath: string; content: string }>[],
): readonly Violation[] =>
  Arr.generate(function* () {
    for (const { relativePath, content } of files) {
      const problem = problemOf(relativePath, content);

      if (problem !== undefined) {
        yield { relativePath, problem };
      }
    }
  });

/**
 * Whether the `"libReplacement": false` line has a comment after the value or
 * directly above it.
 */
const hasReason = (content: string): boolean => {
  const lines = content.split('\n');

  const index = lines.findIndex(
    (text) =>
      !text.trimStart().startsWith('//') &&
      /"libReplacement"\s*:\s*false/u.test(text),
  );

  if (index === -1) {
    return false;
  }

  const line = lines[index] ?? '';

  const above = (lines[index - 1] ?? '').trim();

  return (
    /"libReplacement"\s*:\s*false\s*,?\s*(?:\/\/|\/\*)/u.test(line) ||
    above.startsWith('//') ||
    above.endsWith('*/')
  );
};

const problemOf = (
  relativePath: string,
  content: string,
): Problem | undefined => {
  // These files are JSONC. `parseConfigFileTextToJson` is what tsc itself reads
  // them with, so a commented-out entry is not taken for one.
  const parsed: unknown = ts.parseConfigFileTextToJson(
    relativePath,
    content,
  ).config;

  if (!isRecord(parsed) || !hasKey(parsed, 'compilerOptions')) {
    return 'undeclared';
  }

  const compilerOptions: unknown = parsed.compilerOptions;

  if (
    !isRecord(compilerOptions) ||
    !hasKey(compilerOptions, 'libReplacement')
  ) {
    return 'undeclared';
  }

  const value: unknown = compilerOptions.libReplacement;

  return value === true
    ? undefined
    : value !== false
      ? 'not-boolean'
      : hasReason(content)
        ? undefined
        : 'false-without-reason';
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkTsconfigLibReplacement().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} tsconfig.json file(s) checked; each states \`libReplacement\`, and every \`false\` says why.`,
  );
}
