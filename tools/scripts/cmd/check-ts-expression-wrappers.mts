import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { listTrackedFiles, readRepositoryFile } from '../lib/repo-files.mjs';

/**
 * Fails when a script or config restates the list of TypeScript expression
 * wrappers instead of calling `skipExpressionWrappers` / `isExpressionWrapper`
 * from {@link HELPER_MODULE}.
 *
 * CLAUDE.md ("Lint rules") asks every reader of code to see through
 * parentheses, `as`, `satisfies`, `!`, `<T>` and the like. Each copy of that
 * list has to be found and changed when TypeScript adds a wrapper, and a copy
 * that is missed silently stops matching. A module that tests for
 * {@link THRESHOLD} or more of the wrapper kinds is read as such a copy.
 *
 * What it reads are the modules that can import `tools/`: those under it and a
 * package's `scripts/`. A published package's `src/` cannot, and keeps its own.
 */
export const checkTsExpressionWrappers = async (): Promise<
  Result<number, string>
> => {
  const tracked = await listTrackedFiles();

  if (Result.isErr(tracked)) {
    return Result.err(`❌ ${tracked.value}`);
  }

  const files = tracked.value.filter(isCheckedModule);

  const mut_offenders: string[] = [];

  for (const file of files) {
    const text = await readRepositoryFile(file);

    if (Result.isErr(text)) {
      return Result.err(`❌ ${text.value}`);
    }

    const kinds = wrapperKindsTestedIn(text.value);

    if (Arr.isMinLengthArray(THRESHOLD, kinds)) {
      mut_offenders.push(`  ${file}: ${kinds.join(', ')}`);
    }
  }

  return Arr.isNonEmpty(mut_offenders)
    ? Result.err(
        [
          `❌ ${mut_offenders.length} module(s) test for the TypeScript expression wrappers themselves:`,
          '',
          ...mut_offenders,
          '',
          `Call \`skipExpressionWrappers\` or \`isExpressionWrapper\` from ${HELPER_MODULE},`,
          'so that a wrapper TypeScript adds is added there once.',
        ].join('\n'),
      )
    : Result.ok(files.length);
};

/** The wrapper kinds a module's text tests for, as `ts.is…(` calls. */
export const wrapperKindsTestedIn = (sourceText: string): readonly string[] =>
  WRAPPER_PREDICATES.filter((predicate) =>
    sourceText.includes(`ts.${predicate}(`),
  );

/** The module whose list the others call. */
const HELPER_MODULE = 'tools/scripts/lib/ts-expression-wrappers.mts';

/**
 * How many wrapper kinds a module tests for before it reads as a copy of the
 * list: one or two are a reader that cares about that wrapper alone.
 */
const THRESHOLD = 3;

const WRAPPER_PREDICATES = [
  'isParenthesizedExpression',
  'isAsExpression',
  'isSatisfiesExpression',
  'isNonNullExpression',
  'isTypeAssertionExpression',
  'isExpressionWithTypeArguments',
] as const;

const isCheckedModule = (file: string): boolean =>
  (file.startsWith('tools/') ||
    /^(?:apps|libs)\/[^/]+\/scripts\//u.test(file)) &&
  /\.[cm]?ts$/u.test(file) &&
  !/\.test\.[cm]?ts$/u.test(file) &&
  file !== HELPER_MODULE;

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkTsExpressionWrappers().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} module(s) read the TypeScript expression wrappers through ${HELPER_MODULE}.`,
  );
}
